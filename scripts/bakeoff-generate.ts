/**
 * TEMPORARY — voice bake-off generator (plan §6, Milestone #3). Not part of the
 * build; delete once the narrator is chosen and the §7 provider abstraction lands.
 *
 * Reads the frozen corpus (docs/audio-bakeoff/corpus.md) on every candidate in
 * the slate below and emits a blind contact sheet for the listening test:
 *   docs/audio-bakeoff/clips/{code}/{section}.{mp3|wav}   (gitignored)
 *   docs/audio-bakeoff/contact-sheet.html                 (gitignored, players)
 *   docs/audio-bakeoff/bakeoff-manifest.json              (gitignored, timing/meta)
 * Codes (c1…cN) are STABLE across sections so a listener can track one voice's
 * consistency; display order is shuffled per section to blunt position bias; the
 * code→voice key is hidden behind a reveal.
 *
 * Idempotent: a clip is skipped if it already exists. Delete a file to regen.
 * Run: npx tsx scripts/bakeoff-generate.ts [A|B|probe ...]   (default: all)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { splitWords } from "@/lib/narrative/words";

const ROOT = "docs/audio-bakeoff";
const CLIPS = join(ROOT, "clips");

// ---- frozen corpus (docs/audio-bakeoff/corpus.md) -------------------------
const CORPUS: Record<string, string> = {
  A: [
    "Imagine a hillside in fog so thick you can see nothing — no valley, no horizon, only the ground beneath your boots. You want the lowest point in the whole landscape, and the one thing you can always sense is the tilt of the ground where you stand. So you step in the steepest downhill direction, feel again, and repeat.",
    "That is basic batch gradient descent. No map, no overview, no cleverness — only slope, step, repeat, thousands of times over. On the right, a flat line that knows nothing is about to learn exactly this way. Press play and watch its loss fall by whole powers of ten.",
  ].join("\n\n"),
  B: [
    "Switch the errors from lines to squares. Each residual becomes a literal square whose area is the penalty the line pays there, and the fit is the line that makes the total area smallest — the mean squared error in the readout.",
    "Squaring does two jobs. It ignores direction: overshooting by three is exactly as bad as undershooting by three. And it punishes large misses out of all proportion — one residual of ten contributes the same squared penalty as one hundred residuals of one: 10² = 100 × 1². That second habit is squared error’s whole personality, and the next beat shows its dark side.",
  ].join("\n\n"),
  probe:
    "The model reports R² and MSE; we tune λ and the learning rate η, fit w·x + b by OLS, pass it through a sigmoid to get ŷ, and validate with k-fold cross-validation on a clean train/test split.",
};
const SECTION_LABEL: Record<string, string> = {
  A: "Section A — evocative hook (gradient-descent)",
  B: "Section B — dense mechanism (squared error)",
  probe: "Pronunciation probe (R² · λ · η · w·x+b · OLS · ŷ · k-fold)",
};

// ---- the slate ------------------------------------------------------------
const EL_MODEL = "eleven_multilingual_v2";
// One considered "calm documentary" preset — the fair tuning the baseline never got.
const TUNED = { stability: 0.5, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true };
const DOC_STYLE =
  "Narrate the following in a calm, warm, unhurried voice — a documentary explainer in the register of 3Blue1Brown or Distill: clear and authoritative, thoughtful pacing, never theatrical or salesy.";

type ElSettings = { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean };
type Candidate =
  | { code: string; label: string; provider: "elevenlabs"; voiceMatch: string; model: string; settings: ElSettings | null; baseline?: boolean }
  | { code: string; label: string; provider: "gemini"; voice: string; model: string; style: string };

const SLATE: Candidate[] = [
  { code: "c1", provider: "elevenlabs", voiceMatch: "Roger", model: EL_MODEL, settings: null, baseline: true, label: "ElevenLabs · Roger · default (BASELINE — today's floor)" },
  { code: "c2", provider: "elevenlabs", voiceMatch: "George", model: EL_MODEL, settings: TUNED, label: "ElevenLabs · George (Warm Storyteller) · tuned" },
  { code: "c3", provider: "elevenlabs", voiceMatch: "Daniel", model: EL_MODEL, settings: TUNED, label: "ElevenLabs · Daniel (Steady Broadcaster) · tuned" },
  { code: "c4", provider: "elevenlabs", voiceMatch: "River", model: EL_MODEL, settings: TUNED, label: "ElevenLabs · River (Calm Neutral) · tuned" },
  { code: "c5", provider: "gemini", voice: "Charon", model: "gemini-3.1-flash-tts-preview", style: DOC_STYLE, label: "Gemini · Charon (Informative) · documentary-steer" },
  { code: "c6", provider: "gemini", voice: "Sulafat", model: "gemini-3.1-flash-tts-preview", style: DOC_STYLE, label: "Gemini · Sulafat (Warm) · documentary-steer" },
];

// ---- env ------------------------------------------------------------------
function loadDotEnv() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

// ---- ElevenLabs -----------------------------------------------------------
const EL_API = "https://api.elevenlabs.io/v1";
type Alignment = { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
async function elVoiceMap(apiKey: string): Promise<{ name: string; voice_id: string }[]> {
  const res = await fetch(`${EL_API}/voices`, { headers: { "xi-api-key": apiKey } });
  if (!res.ok) throw new Error(`voices: HTTP ${res.status}`);
  const data = (await res.json()) as { voices: { voice_id: string; name: string }[] };
  return data.voices;
}
async function elSynth(apiKey: string, voiceId: string, model: string, text: string, settings: ElSettings | null) {
  const body: Record<string, unknown> = { text, model_id: model };
  if (settings) body.voice_settings = settings;
  const res = await fetch(`${EL_API}/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`el tts: HTTP ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { audio_base64: string; alignment: Alignment };
  return { audio: Buffer.from(data.audio_base64, "base64"), alignment: data.alignment };
}
function toWordTimings(a: Alignment) {
  const words: { w: string; s: number; e: number }[] = [];
  let cur = "";
  let start = 0;
  let lastEnd = 0;
  for (let i = 0; i < a.characters.length; i++) {
    const ch = a.characters[i];
    if (/\s/.test(ch)) {
      if (cur) {
        words.push({ w: cur, s: start, e: lastEnd });
        cur = "";
      }
    } else {
      if (!cur) start = a.character_start_times_seconds[i];
      cur += ch;
      lastEnd = a.character_end_times_seconds[i];
    }
  }
  if (cur) words.push({ w: cur, s: start, e: lastEnd });
  return words;
}

// ---- Gemini ---------------------------------------------------------------
async function geminiTTS(apiKey: string, model: string, voice: string, text: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
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
function pcmToWav(pcm: Buffer, rate: number): Buffer {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

// ---- Whisper recovery (Gemini timing, best-effort) ------------------------
async function whisperWords(apiKey: string, wav: Buffer) {
  const fd = new FormData();
  fd.append("file", new Blob([new Uint8Array(wav)], { type: "audio/wav" }), "a.wav");
  fd.append("model", "whisper-1");
  fd.append("response_format", "verbose_json");
  fd.append("timestamp_granularities[]", "word");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: fd,
  });
  if (!res.ok) throw new Error(`whisper: HTTP ${res.status}`);
  const data = (await res.json()) as { text: string; words?: { word: string; start: number; end: number }[] };
  return { text: data.text, words: data.words ?? [] };
}
const NUM: Record<string, string> = { "1": "one", "2": "two", "3": "three", "10": "ten", "100": "one hundred" };
function spoken(token: string): string {
  let t = token
    .replace(/²/g, " squared").replace(/×/g, " times").replace(/·/g, " dot ").replace(/=/g, " equals ")
    .replace(/λ/g, " lambda ").replace(/η/g, " eta ").replace(/ŷ/g, " y hat ").replace(/R\b/g, " r ").replace(/[—–-]/g, " ");
  t = t.replace(/\d+/g, (d) => NUM[d] ?? d);
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function coverage(prose: string, ww: { word: string }[]): number {
  // crude: fraction of prose sub-words whose normalized form appears in the transcript.
  const trans = new Set(ww.map((w) => spoken(w.word)).join(" ").split(" ").filter(Boolean));
  const sub = splitWords(prose).flatMap((t) => spoken(t).split(" ").filter(Boolean));
  const hit = sub.filter((s) => trans.has(s)).length;
  return sub.length ? hit / sub.length : 0;
}

// ---- contact sheet --------------------------------------------------------
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function contactSheet(sections: string[], ext: Record<string, string>): string {
  const blocks = sections.map((sec) => {
    const order = [...SLATE].sort((a, b) => hash(a.code + sec) - hash(b.code + sec));
    const players = order
      .map((c) => `      <div class="clip"><span class="code">${c.code}</span><audio controls preload="none" src="clips/${c.code}/${sec}.${ext[c.code]}"></audio></div>`)
      .join("\n");
    return `    <section>
      <h2>${esc(SECTION_LABEL[sec])}</h2>
      <p class="script">${esc(CORPUS[sec])}</p>
${players}
    </section>`;
  }).join("\n");
  const key = SLATE.map((c) => `      <li><b>${c.code}</b> — ${esc(c.label)}</li>`).join("\n");
  return `<!doctype html><meta charset="utf-8"><title>ML Lab — voice bake-off (blind)</title>
<style>
  body{font:16px/1.6 -apple-system,system-ui,sans-serif;max-width:820px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}
  h1{font-size:1.5rem} h2{font-size:1.05rem;margin:2rem 0 .5rem;border-top:1px solid #ddd;padding-top:1rem}
  .script{color:#555;background:#f6f6f4;padding:.75rem 1rem;border-radius:8px;font-size:.95rem;white-space:pre-wrap}
  .clip{display:flex;align-items:center;gap:.75rem;margin:.4rem 0}
  .code{font:600 13px ui-monospace,monospace;background:#1a1a1a;color:#fff;border-radius:5px;padding:.15rem .5rem;min-width:2.2rem;text-align:center}
  audio{height:34px;flex:1} details{margin:1.5rem 0;color:#666} li{margin:.2rem 0}
  .note{color:#888;font-size:.9rem}
</style>
<h1>Voice bake-off — blind contact sheet</h1>
<p class="note">Same frozen script per section (plan §6). Codes are stable across sections — track one code to judge its consistency. Order is shuffled per section. Rubric: intelligibility · register · expressiveness · pacing · pronunciation · consistency. Anchor every voice against the baseline before scoring.</p>
${blocks}
  <details><summary>Reveal candidate key (after scoring)</summary>
    <ul>
${key}
    </ul>
  </details>`;
}

// ---- run ------------------------------------------------------------------
async function main() {
  loadDotEnv();
  const elKey = process.env.ELEVENLABS_API_KEY ?? "";
  const gemKey = process.env.GEMINI_API_KEY ?? "";
  const oaKey = process.env.OPENAI_API_KEY ?? "";
  const args = process.argv.slice(2).filter((a) => CORPUS[a]);
  const sections = args.length ? args : ["A", "B", "probe"];
  mkdirSync(CLIPS, { recursive: true });

  const voices = await elVoiceMap(elKey);
  const resolved = new Map<string, string>();
  for (const c of SLATE) {
    if (c.provider !== "elevenlabs") continue;
    const v = voices.find((x) => x.name === c.voiceMatch) ?? voices.find((x) => x.name.includes(c.voiceMatch));
    if (!v) throw new Error(`ElevenLabs voice not found: ${c.voiceMatch}`);
    resolved.set(c.code, v.voice_id);
    console.log(`${c.code}: ${c.voiceMatch} → ${v.name} (${v.voice_id})`);
  }

  const ext: Record<string, string> = {};
  const manifest: Record<string, unknown>[] = [];
  for (const c of SLATE) {
    ext[c.code] = c.provider === "elevenlabs" ? "mp3" : "wav";
    mkdirSync(join(CLIPS, c.code), { recursive: true });
    for (const sec of sections) {
      const text = CORPUS[sec];
      const out = join(CLIPS, c.code, `${sec}.${ext[c.code]}`);
      const row: Record<string, unknown> = { code: c.code, section: sec, label: c.label };
      if (existsSync(out)) { console.log(`  ${c.code}/${sec}: exists, skip`); manifest.push({ ...row, skipped: true }); continue; }
      try {
        if (c.provider === "elevenlabs") {
          const r = await elSynth(elKey, resolved.get(c.code)!, c.model, text, c.settings);
          writeFileSync(out, r.audio);
          const w = toWordTimings(r.alignment);
          const exact = w.length === splitWords(text).length && w.every((x, i) => x.w === splitWords(text)[i]);
          row.timing = { native: true, wordForWord: exact, words: w.length, dur: w.at(-1)?.e };
          console.log(`  ${c.code}/${sec}: EL ${c.voiceMatch} ✓ word-for-word=${exact} ${w.at(-1)?.e?.toFixed(1)}s`);
        } else {
          let used = c.model;
          let g: { pcm: Buffer; rate: number };
          try {
            g = await geminiTTS(gemKey, c.model, c.voice, `${c.style}\n\n${text}`);
          } catch (e) {
            used = "gemini-2.5-flash-preview-tts";
            console.log(`    ${c.code}/${sec}: ${c.model} failed (${msg(e)}); falling back to ${used}`);
            g = await geminiTTS(gemKey, used, c.voice, `${c.style}\n\n${text}`);
          }
          writeFileSync(out, pcmToWav(g.pcm, g.rate));
          const t = await whisperWords(oaKey, readFileSync(out));
          const cov = coverage(text, t.words);
          const leaked = /narrate|documentary|3blue|distill|unhurried/i.test(t.words.slice(0, 8).map((w) => w.word).join(" "));
          row.timing = { native: false, model: used, recoveryCoverage: Number(cov.toFixed(3)), styleLeak: leaked, dur: (g.pcm.length / g.rate / 2) };
          console.log(`  ${c.code}/${sec}: Gemini ${c.voice} (${used}) ✓ ${(g.pcm.length / g.rate / 2).toFixed(1)}s coverage=${(cov * 100).toFixed(0)}% leak=${leaked}`);
        }
      } catch (e) { row.error = msg(e); console.log(`  ${c.code}/${sec}: ERROR ${msg(e)}`); }
      manifest.push(row);
    }
  }

  writeFileSync(join(ROOT, "bakeoff-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  writeFileSync(join(ROOT, "contact-sheet.html"), contactSheet(sections, ext));
  console.log(`\nContact sheet → ${join(ROOT, "contact-sheet.html")}`);
  console.log(`Manifest      → ${join(ROOT, "bakeoff-manifest.json")}`);
  // (Gemini clips stay .wav, ElevenLabs .mp3 — both play fine in <audio>; no conversion.)
}
main().catch((e) => { console.error(e); process.exit(1); });
