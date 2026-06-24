"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { AudioSection } from "@/lib/narrative/audio";
import type { Term, VizHue } from "@/lib/exhibit/spine";
import { HUE_INK } from "@/lib/narrative/hues";
import { splitWords } from "@/lib/narrative/words";

/**
 * A narrative beat: prose that can read itself aloud (docs/06, B4) and carries
 * the canvas's colour grammar into the words themselves (Stream 2, pattern 3).
 *
 * Spoken narration is word-synced — the transcript is the prose, highlighted
 * word by word as the narrator reaches it. Over that same word stream, key
 * terms are tinted to match their referent on the graphic ("the line" in the
 * prediction blue, "residual" in the error red), always with weight + underline
 * so colour is never the only cue. Without an audio manifest the prose renders
 * plain (still coloured); exhibits without audio yet lose nothing.
 */

/** One narrator at a time, lab-wide: starting a section stops the previous. */
let stopActive: (() => void) | null = null;

/** Strip leading/trailing punctuation so "residuals," matches the term "residuals". */
const normalize = (w: string) =>
  w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

/**
 * Map each whitespace-split word index to a hue, by finding the first run of
 * words that matches each term phrase. Matching is over the section's full word
 * sequence so a phrase can straddle nothing but its own words.
 */
function buildHueMap(words: string[], terms: Term[]): Map<number, VizHue> {
  const map = new Map<number, VizHue>();
  for (const { phrase, hue } of terms) {
    const target = splitWords(phrase).map(normalize);
    if (target.length === 0) continue;
    for (let i = 0; i + target.length <= words.length; i++) {
      let hit = true;
      for (let k = 0; k < target.length; k++) {
        if (normalize(words[i + k]) !== target[k]) {
          hit = false;
          break;
        }
      }
      if (hit) {
        for (let k = 0; k < target.length; k++) map.set(i + k, hue);
        break; // colour the first occurrence only
      }
    }
  }
  return map;
}

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/** Spoken-friendly duration for the accessible name ("45 seconds"). */
const describeDuration = (s: number) => {
  const r = Math.round(s);
  if (r < 60) return `${r} seconds`;
  const m = Math.floor(r / 60);
  const rest = r % 60;
  return rest ? `${m} minutes ${rest} seconds` : `${m} minutes`;
};

export function NarratedSection({
  audio,
  paragraphs,
  tone,
  heading,
  terms,
}: {
  audio?: AudioSection;
  paragraphs: string[];
  /** Hook prose reads strong and dark; story prose muted, measured. */
  tone: "hook" | "story";
  /** Beat heading, rendered above the prose. */
  heading?: string;
  /** Key phrases tinted to match the canvas (pattern 3). */
  terms?: Term[];
}) {
  const pClass =
    tone === "hook"
      ? "mt-4 text-lg leading-relaxed text-ink first:mt-0"
      : "mt-4 leading-relaxed text-ink-muted first:mt-0";

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [wordIndex, setWordIndex] = useState(-1);

  // Word sync runs on animation frames only while playing.
  useEffect(() => {
    if (!playing || !audio) return;
    let raf = 0;
    const tick = () => {
      const el = audioRef.current;
      if (el) {
        const t = el.currentTime;
        let idx = -1;
        for (let i = 0; i < audio.words.length && audio.words[i].s <= t; i++) {
          idx = i;
        }
        setWordIndex(idx);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, audio]);

  // The manifest's words were split from these same paragraphs under the
  // same contract, so running offsets line the transcript up exactly.
  const paragraphWords = paragraphs.map(splitWords);
  const offsets = paragraphWords.reduce<number[]>(
    (acc, _words, i) => [...acc, (acc[i - 1] ?? 0) + (paragraphWords[i - 1]?.length ?? 0)],
    [],
  );
  const hueMap =
    terms && terms.length > 0
      ? buildHueMap(paragraphWords.flat(), terms)
      : null;

  const headingEl = heading ? (
    <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
  ) : null;

  // A word: tinted to its term hue (weight + underline so colour isn't alone),
  // and/or highlighted as the word the narrator is currently speaking.
  const renderWord = (w: string, globalIndex: number) => {
    const active = globalIndex === wordIndex;
    const hue = hueMap?.get(globalIndex);
    const className = active
      ? "rounded-xs bg-sunken text-ink"
      : hue
        ? "font-medium underline decoration-1 underline-offset-2"
        : undefined;
    return (
      // Fragment, not a wrapper span: the word markup ships twice (SSR + RSC),
      // so a second DOM node per word is the dominant HTML cost (C5 budget).
      <Fragment key={globalIndex}>
        <span
          data-word={globalIndex}
          data-active={active || undefined}
          className={className}
          style={!active && hue ? { color: HUE_INK[hue] } : undefined}
        >
          {w}
        </span>{" "}
      </Fragment>
    );
  };

  const proseEl =
    audio || hueMap ? (
      paragraphs.map((p, i) => (
        <p key={i} className={pClass}>
          {paragraphWords[i].map((w, j) => renderWord(w, offsets[i] + j))}
        </p>
      ))
    ) : (
      paragraphs.map((p, i) => (
        <p key={i} className={pClass}>
          {p}
        </p>
      ))
    );

  if (!audio) {
    return (
      <>
        {headingEl}
        {proseEl}
      </>
    );
  }

  const stop = () => {
    audioRef.current?.pause();
    setPlaying(false);
    if (stopActive === stop) stopActive = null;
  };

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      stop();
      return;
    }
    stopActive?.();
    stopActive = stop;
    void el.play();
    setPlaying(true);
  };

  return (
    <>
      {headingEl}
      <audio
        ref={audioRef}
        src={audio.src}
        preload="none"
        onEnded={() => {
          setPlaying(false);
          setWordIndex(-1);
          if (stopActive) stopActive = null;
        }}
      />
      <p className="mt-4 first:mt-0">
        <button
          type="button"
          aria-pressed={playing}
          // Without this the name concatenates as "Listen0:45" (a real
          // screen reader would speak the mash). Keep the Listen/Pause
          // prefix — it is the stable contract the e2e selectors hold.
          aria-label={
            playing
              ? "Pause the narration"
              : `Listen — this section read aloud, ${describeDuration(audio.durationSeconds)}`
          }
          onClick={toggle}
          className="rounded-full border border-line px-4 py-1 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
        >
          {playing ? "Pause" : "Listen"}
          <span className="ml-2 font-mono text-xs text-ink-faint">
            {formatTime(audio.durationSeconds)}
          </span>
        </button>
      </p>
      {proseEl}
    </>
  );
}
