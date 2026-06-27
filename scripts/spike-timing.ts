/**
 * TEMPORARY — audio timing-feasibility spike (docs/audio-timing-spike.md, plan §5).
 * Not part of the build; delete after the spike verdict lands.
 *
 * Answers one pass/fail question per provider: can we produce word-level timings
 * that satisfy the production contract (one {w,s,e} per splitWords(prose) token,
 * monotonic, word-for-word)?
 *   - ElevenLabs: native char-level alignment (with-timestamps) → re-confirm.
 *   - Gemini: raw PCM, no timestamps → OpenAI Whisper word-timestamps, then
 *     sequence-align Whisper's words back onto the prose tokens (the user's chosen
 *     recovery path). The hard case is the symbol cluster "10² = 100 × 1²".
 *
 * Idempotent: synth output is cached under SPIKE_OUT; delete a file to regen it.
 * Run: npx tsx scripts/spike-timing.ts [A|B|probe ...]   (default: A B)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { splitWords } from "@/lib/narrative/words";

const OUT = process.env.SPIKE_OUT ?? join(tmpdir(), "ml-lab-audio-spike");
mkdirSync(OUT, { recursive: true });

// ---- corpus (frozen — docs/audio-bakeoff/corpus.md) -----------------------
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

// ---- env ------------------------------------------------------------------
function loadDotEnv() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}

// ---- ElevenLabs (native, the baseline to re-confirm) ----------------------
const EL_API = "https://api.elevenlabs.io/v1";
const EL_MODEL = "eleven_multilingual_v2";
type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};
async function elVoiceId(apiKey: string): Promise<{ id: string; name: string }> {
  const res = await fetch(`${EL_API}/voices`, { headers: { "xi-api-key": apiKey } });
  if (!res.ok) throw new Error(`voices: HTTP ${res.status}`);
  const data = (await res.json()) as { voices: { voice_id: string; name: string }[] };
  const v = data.voices.find((x) => x.name === (process.env.AUDIO_VOICE ?? "George")) ?? data.voices[0];
  return { id: v.voice_id, name: v.name };
}
async function elSynth(apiKey: string, voiceId: string, text: string) {
  const res = await fetch(
    `${EL_API}/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({ text, model_id: EL_MODEL }),
    },
  );
  if (!res.ok) throw new Error(`el tts: HTTP ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { audio_base64: string; alignment: Alignment };
  return { audio: Buffer.from(data.audio_base64, "base64"), alignment: data.alignment };
}
/** Char alignment → word timings, under the production splitWords contract. */
function toWordTimings(text: string, a: Alignment) {
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

// ---- Gemini TTS (raw PCM, no timestamps) ----------------------------------
const GEM_MODEL = "gemini-2.5-flash-preview-tts";
async function geminiTTS(apiKey: string, text: string, voice = "Kore") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEM_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    }),
  });
  if (!res.ok) throw new Error(`gemini tts: HTTP ${res.status} ${await res.text()}`);
  type GemPart = { inlineData?: { mimeType?: string; data: string } };
  const data = (await res.json()) as { candidates?: { content?: { parts?: GemPart[] } }[] };
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part?.inlineData) throw new Error(`gemini tts: no audio part — ${JSON.stringify(data).slice(0, 300)}`);
  const mime = part.inlineData.mimeType ?? "";
  const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
  return { pcm: Buffer.from(part.inlineData.data, "base64"), rate };
}
/** Wrap signed-16-bit mono PCM in a WAV container so Whisper/ffmpeg can read it. */
function pcmToWav(pcm: Buffer, rate: number): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

// ---- OpenAI Whisper (word timestamps) -------------------------------------
async function whisperWords(apiKey: string, wav: Buffer) {
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
  const data = (await res.json()) as { text: string; words?: { word: string; start: number; end: number }[] };
  return { text: data.text, words: data.words ?? [] };
}

// ---- alignment: Whisper words → prose tokens ------------------------------
const NUM: Record<string, string> = { "0": "zero", "1": "one", "2": "two", "3": "three", "10": "ten", "100": "one hundred", "1000": "one thousand" };
function spoken(token: string): string {
  // Map the corpus's symbol/numeral glyphs to how they're said, for matching only.
  let t = token
    .replace(/²/g, " squared")
    .replace(/×/g, " times")
    .replace(/·/g, " dot ")
    .replace(/=/g, " equals ")
    .replace(/λ/g, " lambda ")
    .replace(/η/g, " eta ")
    .replace(/ŷ/g, " y hat ")
    .replace(/R\b/g, " r ")
    .replace(/[—–-]/g, " "); // dashes are silent / joiners
  t = t.replace(/\d+/g, (d) => NUM[d] ?? d);
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
/** Each prose token → its spoken sub-words (e.g. "10²" → ["ten","squared"]). */
function subWords(token: string): string[] {
  return spoken(token).split(" ").filter(Boolean);
}
function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function simScore(a: string, b: string): number {
  if (a === b) return 2;
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) return 1;
  if (lev(a, b) <= 1) return 1;
  return -1;
}
/**
 * Needleman-Wunsch between prose sub-words and Whisper words; then collapse to a
 * per-prose-token window. Returns one {w,s,e,matched} per splitWords token.
 */
function align(prose: string, ww: { word: string; start: number; end: number }[]) {
  const tokens = splitWords(prose);
  const P: { sw: string; ti: number }[] = [];
  tokens.forEach((tok, ti) => subWords(tok).forEach((sw) => P.push({ sw, ti })));
  const W = ww.map((w) => ({ ...w, n: spoken(w.word) })).filter((w) => w.n);
  const GAP = -1;
  const m = P.length, n = W.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) dp[i][0] = i * GAP;
  for (let j = 1; j <= n; j++) dp[0][j] = j * GAP;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.max(dp[i - 1][j - 1] + simScore(P[i - 1].sw, W[j - 1].n), dp[i - 1][j] + GAP, dp[i][j - 1] + GAP);
  // backtrack → matched whisper words per prose token
  const hits: Record<number, { start: number; end: number }[]> = {};
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (dp[i][j] === dp[i - 1][j - 1] + simScore(P[i - 1].sw, W[j - 1].n)) {
      if (simScore(P[i - 1].sw, W[j - 1].n) > 0) (hits[P[i - 1].ti] ??= []).push(W[j - 1]);
      i--; j--;
    } else if (dp[i][j] === dp[i - 1][j] + GAP) i--;
    else j--;
  }
  // collapse to one window per token; interpolate the misses
  const out = tokens.map((w, ti) => {
    const h = hits[ti];
    if (h && h.length) return { w, s: Math.min(...h.map((x) => x.start)), e: Math.max(...h.map((x) => x.end)), matched: true };
    return { w, s: NaN, e: NaN, matched: false };
  });
  // fill misses by interpolating between the nearest matched neighbours
  for (let k = 0; k < out.length; k++) {
    if (out[k].matched) continue;
    let prev = k - 1; while (prev >= 0 && !out[prev].matched) prev--;
    let next = k + 1; while (next < out.length && !out[next].matched) next--;
    const lo = prev >= 0 ? out[prev].e : 0;
    const hi = next < out.length ? out[next].s : lo;
    out[k].s = lo; out[k].e = Math.max(lo, hi);
  }
  // enforce monotonic non-decreasing starts
  let last = 0;
  for (const o of out) { if (o.s < last) o.s = last; if (o.e < o.s) o.e = o.s; last = o.s; }
  return out;
}

// ---- run ------------------------------------------------------------------
function pct(n: number, d: number) { return d ? `${((100 * n) / d).toFixed(0)}%` : "—"; }
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));
type SectionReport = Record<string, unknown>;

async function main() {
  loadDotEnv();
  const ids = process.argv.slice(2).filter((a) => CORPUS[a]);
  const which = ids.length ? ids : ["A", "B"];
  const elKey = process.env.ELEVENLABS_API_KEY!;
  const gemKey = process.env.GEMINI_API_KEY!;
  const oaKey = process.env.OPENAI_API_KEY!;
  const report: { generatedAt: string; sections: Record<string, SectionReport> } = {
    generatedAt: new Date().toISOString(),
    sections: {},
  };

  const voice = await elVoiceId(elKey);
  console.log(`ElevenLabs voice: ${voice.name} (${voice.id})\n`);

  for (const id of which) {
    const text = CORPUS[id];
    const expected = splitWords(text);
    console.log(`\n=== Section ${id} (${expected.length} words) ===`);
    const sec: SectionReport = { words: expected.length };

    // ElevenLabs native ----------------------------------------------------
    try {
      const mp3 = join(OUT, `el-${id}.mp3`);
      let alignment: Alignment;
      if (existsSync(mp3) && existsSync(join(OUT, `el-${id}.align.json`))) {
        alignment = JSON.parse(readFileSync(join(OUT, `el-${id}.align.json`), "utf8"));
      } else {
        const r = await elSynth(elKey, voice.id, text);
        writeFileSync(mp3, r.audio);
        writeFileSync(join(OUT, `el-${id}.align.json`), JSON.stringify(r.alignment));
        alignment = r.alignment;
      }
      const w = toWordTimings(text, alignment);
      const exact = w.length === expected.length && w.every((x, k) => x.w === expected[k]);
      const mono = w.every((x, k) => k === 0 || x.s >= w[k - 1].s);
      sec.elevenlabs = { wordForWord: exact, monotonic: mono, words: w.length, dur: w.at(-1)?.e };
      console.log(`  ElevenLabs: word-for-word=${exact} monotonic=${mono} dur=${w.at(-1)?.e?.toFixed(1)}s`);
    } catch (e) { sec.elevenlabs = { error: msg(e) }; console.log(`  ElevenLabs ERROR: ${msg(e)}`); }

    // Gemini + Whisper recovery -------------------------------------------
    try {
      const wav = join(OUT, `gem-${id}.wav`);
      if (!existsSync(wav)) {
        const g = await geminiTTS(gemKey, text);
        writeFileSync(wav, pcmToWav(g.pcm, g.rate));
        console.log(`  Gemini: ${(g.pcm.length / g.rate / 2).toFixed(1)}s @ ${g.rate}Hz`);
      }
      const wavBuf = readFileSync(wav);
      const t1 = await whisperWords(oaKey, wavBuf);
      const aligned = align(text, t1.words);
      const matched = aligned.filter((a) => a.matched).length;
      const mono = aligned.every((a, k) => k === 0 || a.s >= aligned[k - 1].s);
      const exactCount = aligned.length === expected.length && aligned.every((a, k) => a.w === expected[k]);
      const misses = aligned.filter((a) => !a.matched).map((a) => a.w);
      // determinism: re-transcribe the SAME audio
      const t2 = await whisperWords(oaKey, wavBuf);
      const det = t1.words.length === t2.words.length && t1.words.every((w, k) => w.word === t2.words[k]?.word);
      const maxDelta = Math.max(0, ...t1.words.map((w, k) => Math.abs(w.start - (t2.words[k]?.start ?? w.start))));
      sec.gemini = {
        wordForWord: exactCount, monotonic: mono,
        coverage: `${matched}/${aligned.length} (${pct(matched, aligned.length)})`,
        interpolated: misses, whisperWords: t1.words.length, whisperText: t1.text,
        determinismWordsMatch: det, determinismMaxStartDeltaSec: Number(maxDelta.toFixed(3)),
        dur: aligned.at(-1)?.e,
      };
      writeFileSync(join(OUT, `gem-${id}.aligned.json`), JSON.stringify({ whisper: t1, aligned }, null, 2));
      console.log(`  Gemini→Whisper: word-for-word=${exactCount} monotonic=${mono} direct-match=${matched}/${aligned.length} (${pct(matched, aligned.length)})`);
      console.log(`    interpolated tokens (${misses.length}): ${misses.join(" · ") || "none"}`);
      console.log(`    determinism: words-identical=${det} maxStartΔ=${maxDelta.toFixed(3)}s`);
    } catch (e) { sec.gemini = { error: msg(e) }; console.log(`  Gemini ERROR: ${msg(e)}`); }

    report.sections[id] = sec;
  }
  writeFileSync(join(OUT, "spike-report.json"), JSON.stringify(report, null, 2));
  console.log(`\nReport → ${join(OUT, "spike-report.json")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
