import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  AudioManifestSchema,
  sectionText,
  splitWords,
  type AudioManifest,
  type AudioSection,
  type WordTiming,
} from "@/lib/narrative/audio";
import { alignWordsToProse, matchCoverage, type AsrWord } from "@/lib/narrative/align";
import type { ExhibitNarrative } from "@/lib/narrative/schema";
import { linearRegressionNarrative } from "@content/exhibits/linear-regression/narrative";
import { gradientDescentNarrative } from "@content/exhibits/gradient-descent/narrative";

/**
 * Narration generator (docs/06, B4; docs/04 content pipeline): turns each
 * exhibit's narrative sections into spoken audio with word-level timings.
 *
 * Two providers behind one interface (docs/audio-narration-bakeoff-plan.md §7):
 *   - gemini (the chosen narrator, Sulafat — bake-off Milestone #4): no native
 *     timestamps, so the spike's recovery path runs (TTS → Whisper word-ts →
 *     map to prose, see src/lib/narrative/align.ts).
 *   - elevenlabs: native char-level alignment via the with-timestamps endpoint.
 * Both must satisfy the same contract: one {w,s,e} per splitWords(prose) token,
 * word-for-word and monotonic — the invariant content/exhibits/audio.test.ts
 * checks, so the manifest can never silently lie to the player.
 *
 * Idempotent: a section is regenerated only when its prose textHash drifts, or
 * when the provider / voice / model changes (the manifest records all three).
 * Re-running after a one-paragraph edit costs one section, not the catalog.
 *
 * Artifacts are committed (local-first, static hosting, zero runtime infra):
 *   public/audio/{nodeId}/{sectionId}.mp3
 *   content/exhibits/{nodeId}/audio-manifest.json
 *
 * Config (env): AUDIO_PROVIDER=gemini|elevenlabs (default gemini),
 *   AUDIO_VOICE (default Sulafat for gemini / George for elevenlabs),
 *   AUDIO_MODEL (override the provider default).
 */

const narratives: ExhibitNarrative[] = [
  linearRegressionNarrative,
  gradientDescentNarrative,
];

// ---- env ------------------------------------------------------------------

function loadDotEnv() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`${name} missing (expected in .env)`);
    process.exit(1);
  }
  return v;
}

// ---- the shared provider contract -----------------------------------------

type Synthesized = { audio: Buffer; words: WordTiming[]; durationSeconds: number };
type Provider = {
  name: "gemini" | "elevenlabs";
  voiceId: string;
  modelId: string;
  /** text → committed mp3 bytes + word timings that satisfy the contract. */
  synthesize: (text: string) => Promise<Synthesized>;
};

/** The one invariant both providers' output must satisfy (audio.test.ts). */
function assertContract(text: string, words: WordTiming[]) {
  const expected = splitWords(text);
  if (words.length !== expected.length || words.some((w, i) => w.w !== expected[i])) {
    throw new Error(
      `timings diverge from splitWords for "${text.slice(0, 40)}…" ` +
        `(${words.length} vs ${expected.length})`,
    );
  }
  let last = 0;
  for (const w of words) {
    if (w.s < last || w.e < w.s) throw new Error(`non-monotonic timing at "${w.w}"`);
    last = w.s;
  }
}

// ---- ElevenLabs (native char-level alignment) -----------------------------

const EL_API = "https://api.elevenlabs.io/v1";
type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

async function elResolveVoice(apiKey: string, name: string): Promise<string> {
  const res = await fetch(`${EL_API}/voices`, { headers: { "xi-api-key": apiKey } });
  if (!res.ok) throw new Error(`voices: HTTP ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { voices: { voice_id: string; name: string }[] };
  // Exact name first, then substring (so "George" finds "George (Warm Storyteller)"),
  // then the account default — never silently the wrong stock voice without a log.
  const v =
    data.voices.find((x) => x.name === name) ??
    data.voices.find((x) => x.name.toLowerCase().includes(name.toLowerCase())) ??
    data.voices[0];
  if (!v) throw new Error("no voices available on this account");
  if (v.name !== name) console.log(`voice: "${name}" → "${v.name}" (${v.voice_id})`);
  else console.log(`voice: ${v.name} (${v.voice_id})`);
  return v.voice_id;
}

/** Character alignment → word timings under the splitWords contract. */
function foldCharAlignment(a: Alignment): WordTiming[] {
  const words: WordTiming[] = [];
  let current = "";
  let start = 0;
  let lastEnd = 0;
  for (let i = 0; i < a.characters.length; i++) {
    const ch = a.characters[i];
    if (/\s/.test(ch)) {
      if (current) {
        words.push({ w: current, s: start, e: lastEnd });
        current = "";
      }
    } else {
      if (!current) start = a.character_start_times_seconds[i];
      current += ch;
      lastEnd = a.character_end_times_seconds[i];
    }
  }
  if (current) words.push({ w: current, s: start, e: lastEnd });
  return words;
}

async function elevenLabsProvider(voiceName: string, modelId: string): Promise<Provider> {
  const apiKey = requireEnv("ELEVENLABS_API_KEY");
  const voiceId = await elResolveVoice(apiKey, voiceName); // resolve up front so the idempotence key is stable
  return {
    name: "elevenlabs",
    voiceId,
    modelId,
    async synthesize(text) {
      const res = await fetch(
        `${EL_API}/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": apiKey, "content-type": "application/json" },
          body: JSON.stringify({ text, model_id: modelId }),
        },
      );
      if (!res.ok) throw new Error(`el tts: HTTP ${res.status} ${await res.text()}`);
      const data = (await res.json()) as { audio_base64: string; alignment: Alignment };
      const words = foldCharAlignment(data.alignment);
      return {
        audio: Buffer.from(data.audio_base64, "base64"),
        words,
        durationSeconds: words.at(-1)?.e ?? 0,
      };
    },
  };
}

// ---- Gemini (TTS → ffmpeg mp3 → Whisper recovery) -------------------------

const GEM_STYLE =
  "Narrate the following in a calm, warm, unhurried voice — a documentary explainer in the register of 3Blue1Brown or Distill: clear and authoritative, thoughtful pacing, never theatrical or salesy.";

async function geminiTTS(apiKey: string, model: string, voice: string, text: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${GEM_STYLE}\n\n${text}` }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    }),
  });
  if (!res.ok) throw new Error(`gemini tts (${model}): HTTP ${res.status} ${await res.text()}`);
  type GemPart = { inlineData?: { mimeType?: string; data: string } };
  const data = (await res.json()) as { candidates?: { content?: { parts?: GemPart[] } }[] };
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part?.inlineData) throw new Error(`gemini tts: no audio — ${JSON.stringify(data).slice(0, 200)}`);
  const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType ?? "")?.[1] ?? 24000);
  return { pcm: Buffer.from(part.inlineData.data, "base64"), rate };
}

/** Wrap signed-16-bit mono PCM in a WAV container (for Whisper + ffmpeg). */
function pcmToWav(pcm: Buffer, rate: number): Buffer {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28); // byte rate
  h.writeUInt16LE(2, 32); // block align
  h.writeUInt16LE(16, 34); // bits
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

/** WAV → mp3 via ffmpeg (local-only generation step; mp3 keeps committed audio small). */
function wavToMp3(wav: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ff = spawn(
      "ffmpeg",
      ["-hide_banner", "-loglevel", "error", "-f", "wav", "-i", "pipe:0",
       "-codec:a", "libmp3lame", "-q:a", "4", "-f", "mp3", "pipe:1"],
      { stdio: ["pipe", "pipe", "pipe"] },
    );
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    ff.stdout.on("data", (d) => out.push(d));
    ff.stderr.on("data", (d) => err.push(d));
    ff.on("error", (e) =>
      reject(
        (e as NodeJS.ErrnoException).code === "ENOENT"
          ? new Error("ffmpeg not found — required to encode Gemini audio to mp3 (brew install ffmpeg)")
          : e,
      ),
    );
    ff.on("close", (code) =>
      code === 0
        ? resolve(Buffer.concat(out))
        : reject(new Error(`ffmpeg exited ${code}: ${Buffer.concat(err).toString()}`)),
    );
    ff.stdin.write(wav);
    ff.stdin.end();
  });
}

async function whisperWords(apiKey: string, wav: Buffer): Promise<AsrWord[]> {
  const fd = new FormData();
  fd.append("file", new Blob([new Uint8Array(wav)], { type: "audio/wav" }), "audio.wav");
  fd.append("model", "whisper-1");
  fd.append("response_format", "verbose_json");
  fd.append("timestamp_granularities[]", "word");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd,
  });
  if (!res.ok) throw new Error(`whisper: HTTP ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { words?: AsrWord[] };
  return data.words ?? [];
}

function geminiProvider(voice: string, modelId: string): Provider {
  const gemKey = requireEnv("GEMINI_API_KEY");
  const oaKey = requireEnv("OPENAI_API_KEY"); // Whisper recovery
  return {
    name: "gemini",
    voiceId: voice, // Gemini voices are named, not id'd; the name is the stable key
    modelId,
    // No silent model fallback in production: a mid-catalog model swap would
    // change the voice's timbre between sections (the plan's consistency risk).
    // A failure here is surfaced so the operator decides. Override via AUDIO_MODEL.
    async synthesize(text) {
      const tts = await geminiTTS(gemKey, modelId, voice, text);
      const wav = pcmToWav(tts.pcm, tts.rate);
      const asr = await whisperWords(oaKey, wav);
      const words = alignWordsToProse(text, asr);
      const coverage = matchCoverage(text, asr);
      if (coverage < 0.85)
        console.warn(`  ⚠ low timing coverage ${(coverage * 100).toFixed(0)}% — transcript may have drifted`);
      const mp3 = await wavToMp3(wav);
      return {
        audio: mp3,
        words,
        durationSeconds: tts.pcm.length / tts.rate / 2, // true media length (16-bit mono)
      };
    },
  };
}

// ---- provider selection ---------------------------------------------------

async function makeProvider(): Promise<Provider> {
  const which = (process.env.AUDIO_PROVIDER ?? "gemini").toLowerCase();
  if (which === "elevenlabs") {
    return elevenLabsProvider(
      process.env.AUDIO_VOICE ?? "George",
      process.env.AUDIO_MODEL ?? "eleven_multilingual_v2",
    );
  }
  if (which === "gemini") {
    return geminiProvider(
      process.env.AUDIO_VOICE ?? "Sulafat",
      process.env.AUDIO_MODEL ?? "gemini-3.1-flash-tts-preview",
    );
  }
  console.error(`unknown AUDIO_PROVIDER "${which}" (expected gemini|elevenlabs)`);
  process.exit(1);
}

// ---- main -----------------------------------------------------------------

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

const manifestPath = (nodeId: string) =>
  join("content", "exhibits", nodeId, "audio-manifest.json");
const audioPath = (nodeId: string, sectionId: string) =>
  join("public", "audio", nodeId, `${sectionId}.mp3`);

function loadManifest(nodeId: string): AudioManifest | null {
  const p = manifestPath(nodeId);
  if (!existsSync(p)) return null;
  return AudioManifestSchema.parse(JSON.parse(readFileSync(p, "utf8")));
}

async function main() {
  loadDotEnv();
  const provider = await makeProvider();
  console.log(`provider: ${provider.name} · voice ${provider.voiceId} · model ${provider.modelId}`);

  for (const narrative of narratives) {
    const existing = loadManifest(narrative.nodeId);
    // Reuse a section only if provider + voice + model all still match.
    const reusable = new Map<string, AudioSection>(
      existing &&
      existing.provider === provider.name &&
      existing.voiceId === provider.voiceId &&
      existing.modelId === provider.modelId
        ? existing.sections.map((s) => [s.id, s])
        : [],
    );

    const wanted: { id: string; text: string }[] = [
      { id: "hook", text: sectionText(narrative.hook) },
      ...narrative.story.map((s) => ({ id: s.id, text: sectionText(s.paragraphs) })),
    ];

    const sections: AudioSection[] = [];
    for (const { id, text } of wanted) {
      const hash = sha256(text);
      const prior = reusable.get(id);
      if (prior && prior.textHash === hash && existsSync(audioPath(narrative.nodeId, id))) {
        console.log(`${narrative.nodeId}/${id}: current, skipping`);
        sections.push(prior);
        continue;
      }
      console.log(`${narrative.nodeId}/${id}: generating (${text.length} chars)…`);
      const { audio, words, durationSeconds } = await provider.synthesize(text);
      assertContract(text, words);
      const out = audioPath(narrative.nodeId, id);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, audio);
      sections.push({
        id,
        textHash: hash,
        src: `/audio/${narrative.nodeId}/${id}.mp3`,
        durationSeconds: Math.max(Math.round(durationSeconds * 100) / 100, words.at(-1)?.e ?? 0),
        words,
      });
      console.log(`  → ${out} (${(audio.length / 1024).toFixed(0)} KB, ${words.length} words)`);
    }

    const manifest: AudioManifest = {
      nodeId: narrative.nodeId,
      provider: provider.name,
      voiceId: provider.voiceId,
      modelId: provider.modelId,
      generatedAt: new Date().toISOString(),
      sections,
    };
    AudioManifestSchema.parse(manifest);
    writeFileSync(manifestPath(narrative.nodeId), JSON.stringify(manifest, null, 2) + "\n");
    console.log(`${narrative.nodeId}: manifest written (${sections.length} sections)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
