"use client";

import { useEffect, useRef, useState } from "react";
import type { AudioSection } from "@/lib/narrative/audio";
import { splitWords } from "@/lib/narrative/words";

/**
 * A narrative section that can read itself aloud (docs/06, B4): spoken
 * narration with a word-synced transcript — the transcript being the prose
 * itself, highlighted word by word as the narrator reaches it. Without a
 * manifest the prose renders plain, so exhibits without audio yet lose
 * nothing.
 */

/** One narrator at a time, lab-wide: starting a section stops the previous. */
let stopActive: (() => void) | null = null;

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export function NarratedSection({
  audio,
  paragraphs,
  tone,
}: {
  audio?: AudioSection;
  paragraphs: string[];
  /** Hook prose reads dark and full-width-ish; story prose muted, measured. */
  tone: "hook" | "story";
}) {
  const pClass =
    tone === "hook"
      ? "mt-4 leading-relaxed text-ink first:mt-0"
      : "mt-4 max-w-[65ch] leading-relaxed text-ink-muted";

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

  if (!audio) {
    return (
      <>
        {paragraphs.map((p, i) => (
          <p key={i} className={pClass}>
            {p}
          </p>
        ))}
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

  // The manifest's words were split from these same paragraphs under the
  // same contract, so running offsets line the transcript up exactly.
  const paragraphWords = paragraphs.map(splitWords);
  const offsets = paragraphWords.reduce<number[]>(
    (acc, words, i) => [...acc, (acc[i - 1] ?? 0) + (paragraphWords[i - 1]?.length ?? 0)],
    [],
  );

  return (
    <>
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
          onClick={toggle}
          className="rounded-full border border-line px-4 py-1 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
        >
          {playing ? "Pause" : "Listen"}
          <span className="ml-2 font-mono text-xs text-ink-faint">
            {formatTime(audio.durationSeconds)}
          </span>
        </button>
      </p>
      {paragraphs.map((p, i) => {
        const words = paragraphWords[i];
        const offset = offsets[i];
        return (
          <p key={i} className={pClass}>
            {words.map((w, j) => {
              const active = offset + j === wordIndex;
              return (
                <span key={j}>
                  <span
                    data-word={offset + j}
                    data-active={active || undefined}
                    className={active ? "rounded-xs bg-sunken text-ink" : undefined}
                  >
                    {w}
                  </span>{" "}
                </span>
              );
            })}
          </p>
        );
      })}
    </>
  );
}
