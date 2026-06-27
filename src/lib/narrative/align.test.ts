import { describe, expect, it } from "vitest";
import { alignWordsToProse, matchCoverage, spoken, type AsrWord } from "./align";
import { splitWords } from "./words";

/**
 * The Gemini timing-recovery contract (docs/audio-timing-spike.md): whatever the
 * ASR transcript looks like, the aligner must emit exactly one {w,s,e} per
 * splitWords(prose) token, word-for-word and monotonic — that is the same
 * invariant `content/exhibits/audio.test.ts` enforces on the player's manifest.
 * These tests exercise it with synthetic Whisper payloads, so the heart of the
 * provider abstraction is verified without any audio or API spend.
 */

/** Lay synthetic ASR words end-to-end at a steady cadence from `spoken` forms. */
function fakeAsr(spokenWords: string[], wordDur = 0.3, gap = 0.05): AsrWord[] {
  let t = 0;
  return spokenWords.map((word) => {
    const start = t;
    const end = t + wordDur;
    t = end + gap;
    return { word, start, end };
  });
}

function assertContract(prose: string, out: ReturnType<typeof alignWordsToProse>) {
  // word-for-word with splitWords
  expect(out.map((o) => o.w)).toEqual(splitWords(prose));
  // every time finite, end ≥ start, starts monotonic non-decreasing
  let last = -Infinity;
  for (const o of out) {
    expect(Number.isFinite(o.s), `start finite for "${o.w}"`).toBe(true);
    expect(Number.isFinite(o.e), `end finite for "${o.w}"`).toBe(true);
    expect(o.e).toBeGreaterThanOrEqual(o.s);
    expect(o.s).toBeGreaterThanOrEqual(last);
    last = o.s;
  }
}

describe("spoken()", () => {
  it("maps the lab's symbol/numeral vocabulary to how it is voiced", () => {
    expect(spoken("10²")).toBe("ten squared");
    expect(spoken("100")).toBe("one hundred");
    expect(spoken("×")).toBe("times");
    expect(spoken("λ")).toBe("lambda");
    expect(spoken("ŷ")).toBe("y hat");
    expect(spoken("w·x")).toBe("w dot x");
    expect(spoken("—")).toBe(""); // dashes are silent
  });
});

describe("alignWordsToProse", () => {
  it("recovers clean prose word-for-word with high coverage", () => {
    const prose = "Press play and watch its loss fall.";
    const asr = fakeAsr(["press", "play", "and", "watch", "its", "loss", "fall"]);
    const out = alignWordsToProse(prose, asr);
    assertContract(prose, out);
    expect(matchCoverage(prose, asr)).toBeGreaterThan(0.95);
    // matched windows take the transcript's times, in order
    expect(out[0].s).toBeCloseTo(0, 2);
    expect(out.at(-1)!.e).toBeGreaterThan(out[0].e);
  });

  it("handles the symbol/numeral cluster (the spike's timing gauntlet)", () => {
    const prose = "one residual of ten: 10² = 100 × 1².";
    // how Whisper actually voices it (the spike's hard case)
    const asr = fakeAsr([
      "one", "residual", "of", "ten",
      "ten", "squared", "equals", "one", "hundred", "times", "one", "squared",
    ]);
    const out = alignWordsToProse(prose, asr);
    assertContract(prose, out);
    // the symbol tokens still each get a real (matched, non-interpolated) window
    const sq = out.find((o) => o.w === "10²")!;
    expect(sq.e).toBeGreaterThan(sq.s);
  });

  it("interpolates silent/missed tokens between matched neighbours, staying monotonic", () => {
    const prose = "slope — step — repeat";
    // dashes are silent; ASR only voices the three real words
    const asr = fakeAsr(["slope", "step", "repeat"]);
    const out = alignWordsToProse(prose, asr);
    assertContract(prose, out);
    const dash = out.filter((o) => o.w === "—");
    expect(dash).toHaveLength(2);
    // an interpolated dash sits between its neighbours' windows
    const slope = out[0];
    const step = out[2];
    expect(dash[0].s).toBeGreaterThanOrEqual(slope.s);
    expect(dash[0].e).toBeLessThanOrEqual(step.e);
  });

  it("never breaks the contract even on a garbage transcript", () => {
    const prose = "the fit is the line that makes the total area smallest";
    const out = alignWordsToProse(prose, fakeAsr(["wholly", "unrelated", "noise"]));
    assertContract(prose, out); // word-for-word + monotonic still hold
  });

  it("survives an empty transcript (every token interpolated to t=0)", () => {
    const prose = "no audio at all";
    const out = alignWordsToProse(prose, []);
    assertContract(prose, out);
    expect(out.every((o) => o.s === 0)).toBe(true);
  });
});
