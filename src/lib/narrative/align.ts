import { splitWords } from "./words";
import type { WordTiming } from "./audio";

/**
 * Word-timing recovery for a TTS provider with no native timestamps (Gemini —
 * docs/audio-narration-bakeoff-plan.md §5, validated in docs/audio-timing-spike.md):
 *
 *   prose + ASR word-timestamps → one {w, s, e} per splitWords(prose) token
 *
 * The contract every provider must satisfy is `audio.test.ts`'s: the timings
 * reproduce `splitWords(prose)` **word-for-word** and run **monotonically**.
 * That is guaranteed here *by construction* — the output is exactly
 * `splitWords(prose)` mapped to windows, so a poor transcript degrades timing
 * accuracy (some tokens get interpolated), never the contract.
 *
 * The ASR words are aligned to the prose with Needleman–Wunsch over a *spoken*
 * normalisation of both sides ("10²"→"ten squared", "λ"→"lambda", dashes→silent),
 * so symbol/numeral tokens line up with how they were actually voiced. Matched
 * tokens take the transcript's times; unmatched (silent dashes, an ASR hiccup)
 * are interpolated between their nearest matched neighbours.
 */

export type AsrWord = { word: string; start: number; end: number };

/** A prose token's spoken form is one or more sub-words. Used for matching only. */
const NUM: Record<string, string> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
  "10": "ten",
  "11": "eleven",
  "12": "twelve",
  "20": "twenty",
  "100": "one hundred",
  "1000": "one thousand",
};

/**
 * How a prose/ASR token is *said*, lowercased and stripped to matchable words.
 * Corpus-aware (the lab's symbol vocabulary); unknown multi-digit numbers are
 * left as digits, since Whisper's `verbose_json` often emits them that way and a
 * miss just interpolates harmlessly. Deliberately small — see the caveat in
 * docs/audio-timing-spike.md about a general number-to-words pass at scale.
 */
export function spoken(token: string): string {
  let t = token
    .replace(/²/g, " squared ")
    .replace(/³/g, " cubed ")
    .replace(/×/g, " times ")
    .replace(/·/g, " dot ")
    .replace(/÷/g, " divided by ")
    .replace(/=/g, " equals ")
    .replace(/λ/g, " lambda ")
    .replace(/η/g, " eta ")
    .replace(/σ/g, " sigma ")
    .replace(/μ/g, " mu ")
    .replace(/ŷ/g, " y hat ")
    .replace(/x̄/g, " x bar ")
    .replace(/√/g, " square root ")
    .replace(/\bR\b/g, " r ")
    .replace(/[—–-]/g, " "); // dashes are silent joiners
  t = t.replace(/\b\d+\b/g, (d) => NUM[d] ?? d);
  return t
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Each prose token → its spoken sub-words (e.g. "10²" → ["ten","squared"]). */
function subWords(token: string): string[] {
  return spoken(token).split(" ").filter(Boolean);
}

function lev(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return d[m][n];
}

/** Similarity of two spoken sub-words: exact > prefix/near > mismatch. */
function simScore(a: string, b: string): number {
  if (a === b) return 2;
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) return 1;
  if (lev(a, b) <= 1) return 1;
  return -1;
}

/**
 * Map ASR words (with times) onto prose tokens and return one {w, s, e} per
 * `splitWords(prose)` token — word-for-word, monotonic, every time finite.
 */
export function alignWordsToProse(prose: string, asr: AsrWord[]): WordTiming[] {
  const tokens = splitWords(prose);

  // Flatten prose to spoken sub-words, each tagged with its prose-token index.
  const P: { sw: string; ti: number }[] = [];
  tokens.forEach((tok, ti) => subWords(tok).forEach((sw) => P.push({ sw, ti })));
  const W = asr.map((w) => ({ ...w, n: spoken(w.word) })).filter((w) => w.n);

  // Needleman–Wunsch over the spoken sub-word sequences.
  const GAP = -1;
  const m = P.length;
  const n = W.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) dp[i][0] = i * GAP;
  for (let j = 1; j <= n; j++) dp[0][j] = j * GAP;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + simScore(P[i - 1].sw, W[j - 1].n),
        dp[i - 1][j] + GAP,
        dp[i][j - 1] + GAP,
      );

  // Backtrack → the ASR windows that matched each prose token.
  const hits: Record<number, AsrWord[]> = {};
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (dp[i][j] === dp[i - 1][j - 1] + simScore(P[i - 1].sw, W[j - 1].n)) {
      if (simScore(P[i - 1].sw, W[j - 1].n) > 0) (hits[P[i - 1].ti] ??= []).push(W[j - 1]);
      i--;
      j--;
    } else if (dp[i][j] === dp[i - 1][j] + GAP) {
      i--;
    } else {
      j--;
    }
  }

  // One window per prose token; misses marked for interpolation.
  const out = tokens.map((w, ti) => {
    const h = hits[ti];
    if (h && h.length)
      return {
        w,
        s: Math.min(...h.map((x) => x.start)),
        e: Math.max(...h.map((x) => x.end)),
        matched: true,
      };
    return { w, s: NaN, e: NaN, matched: false };
  });

  // Fill misses by interpolating between the nearest matched neighbours.
  for (let k = 0; k < out.length; k++) {
    if (out[k].matched) continue;
    let prev = k - 1;
    while (prev >= 0 && !out[prev].matched) prev--;
    let next = k + 1;
    while (next < out.length && !out[next].matched) next++;
    const lo = prev >= 0 ? out[prev].e : 0;
    const hi = next < out.length ? out[next].s : lo;
    out[k].s = lo;
    out[k].e = Math.max(lo, hi);
  }

  // Enforce monotonic non-decreasing starts (the player + audio.test.ts require it).
  let last = 0;
  for (const o of out) {
    if (!(o.s >= last)) o.s = last; // also coerces any residual NaN
    if (!(o.e >= o.s)) o.e = o.s;
    last = o.s;
  }

  return out.map(({ w, s, e }) => ({ w, s, e }));
}

/** Fraction of prose tokens that got a *direct* ASR match (timing-quality gauge). */
export function matchCoverage(prose: string, asr: AsrWord[]): number {
  const tokens = splitWords(prose);
  if (!tokens.length) return 1;
  const trans = new Set(
    asr
      .map((w) => spoken(w.word))
      .join(" ")
      .split(" ")
      .filter(Boolean),
  );
  const hit = tokens.filter((tok) =>
    subWords(tok).some((sw) => trans.has(sw)),
  ).length;
  return hit / tokens.length;
}
