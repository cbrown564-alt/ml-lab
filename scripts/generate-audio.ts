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
import type { ExhibitNarrative } from "@/lib/narrative/schema";
import { linearRegressionNarrative } from "@content/exhibits/linear-regression/narrative";
import { gradientDescentNarrative } from "@content/exhibits/gradient-descent/narrative";

/**
 * Narration generator (docs/06, B4; docs/04 content pipeline): turns each
 * exhibit's narrative sections into spoken audio with word-level timings via
 * the ElevenLabs with-timestamps endpoint. Idempotent: a section is only
 * regenerated when its prose no longer matches the manifest's textHash, so
 * re-running after a one-paragraph edit costs one section, not the catalog.
 *
 * Artifacts are committed (local-first, static hosting, zero runtime infra):
 *   public/audio/{nodeId}/{sectionId}.mp3
 *   content/exhibits/{nodeId}/audio-manifest.json
 */

const VOICE_NAME = process.env.AUDIO_VOICE ?? "George";
const MODEL_ID = "eleven_multilingual_v2";
const API = "https://api.elevenlabs.io/v1";

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

// ---- elevenlabs -----------------------------------------------------------

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

async function resolveVoiceId(apiKey: string): Promise<string> {
  const res = await fetch(`${API}/voices`, { headers: { "xi-api-key": apiKey } });
  if (!res.ok) throw new Error(`voices: HTTP ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { voices: { voice_id: string; name: string }[] };
  const voice =
    data.voices.find((v) => v.name === VOICE_NAME) ?? data.voices[0];
  if (!voice) throw new Error("no voices available on this account");
  console.log(`voice: ${voice.name} (${voice.voice_id})`);
  return voice.voice_id;
}

async function synthesize(
  apiKey: string,
  voiceId: string,
  text: string,
): Promise<{ audio: Buffer; alignment: Alignment }> {
  const res = await fetch(
    `${API}/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({ text, model_id: MODEL_ID }),
    },
  );
  if (!res.ok) throw new Error(`tts: HTTP ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { audio_base64: string; alignment: Alignment };
  return { audio: Buffer.from(data.audio_base64, "base64"), alignment: data.alignment };
}

/**
 * Character alignment → word timings, under the same word-splitting contract
 * the player renders with. The two must agree word-for-word — verified below.
 */
function toWordTimings(text: string, a: Alignment): WordTiming[] {
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

  const expected = splitWords(text);
  if (
    words.length !== expected.length ||
    words.some((w, i) => w.w !== expected[i])
  ) {
    throw new Error(
      `alignment words diverge from splitWords for text starting "${text.slice(0, 40)}…" ` +
        `(${words.length} vs ${expected.length})`,
    );
  }
  return words;
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
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY missing (expected in .env)");
    process.exit(1);
  }
  const voiceId = await resolveVoiceId(apiKey);

  for (const narrative of narratives) {
    const existing = loadManifest(narrative.nodeId);
    const reusable = new Map<string, AudioSection>(
      existing && existing.voiceId === voiceId && existing.modelId === MODEL_ID
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
      const { audio, alignment } = await synthesize(apiKey, voiceId, text);
      const words = toWordTimings(text, alignment);
      const out = audioPath(narrative.nodeId, id);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, audio);
      sections.push({
        id,
        textHash: hash,
        src: `/audio/${narrative.nodeId}/${id}.mp3`,
        durationSeconds: Math.round(words[words.length - 1].e * 100) / 100,
        words,
      });
      console.log(`  → ${out} (${(audio.length / 1024).toFixed(0)} KB, ${words.length} words)`);
    }

    const manifest: AudioManifest = {
      nodeId: narrative.nodeId,
      voiceId,
      modelId: MODEL_ID,
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
