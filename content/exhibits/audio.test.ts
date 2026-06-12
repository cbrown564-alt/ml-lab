import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sectionText, splitWords } from "@/lib/narrative/audio";
import { audioManifests } from "./audio";
import { gradientDescentNarrative } from "./gradient-descent/narrative";
import { linearRegressionNarrative } from "./linear-regression/narrative";

/**
 * Audio-staleness discipline (docs/06, C3/B4): narration is generated from
 * the prose, so the prose and the audio must never drift apart silently.
 * Edited a paragraph? This test goes red until `npm run audio` regenerates
 * that section.
 */

const narratives = [linearRegressionNarrative, gradientDescentNarrative];
const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

describe("narration audio", () => {
  for (const narrative of narratives) {
    describe(narrative.nodeId, () => {
      const manifest = audioManifests[narrative.nodeId];

      it("has a manifest covering the hook and every story section", () => {
        expect(manifest).toBeDefined();
        const ids = new Set(manifest.sections.map((s) => s.id));
        expect(ids.has("hook")).toBe(true);
        for (const s of narrative.story) expect(ids.has(s.id), s.id).toBe(true);
      });

      it("is generated from the current prose (no stale audio)", () => {
        const texts = new Map<string, string>([
          ["hook", sectionText(narrative.hook)],
          ...narrative.story.map(
            (s) => [s.id, sectionText(s.paragraphs)] as const,
          ),
        ]);
        for (const section of manifest.sections) {
          const text = texts.get(section.id);
          expect(text, section.id).toBeDefined();
          expect(section.textHash, `${section.id} drifted — run npm run audio`).toBe(
            sha256(text!),
          );
        }
      });

      it("word timings match the prose word-for-word and run forward", () => {
        const texts = new Map<string, string>([
          ["hook", sectionText(narrative.hook)],
          ...narrative.story.map(
            (s) => [s.id, sectionText(s.paragraphs)] as const,
          ),
        ]);
        for (const section of manifest.sections) {
          const expected = splitWords(texts.get(section.id)!);
          expect(section.words.map((w) => w.w)).toEqual(expected);
          let last = 0;
          for (const w of section.words) {
            expect(w.s, `${section.id}: "${w.w}"`).toBeGreaterThanOrEqual(last);
            expect(w.e).toBeGreaterThanOrEqual(w.s);
            last = w.s;
          }
          expect(section.durationSeconds).toBeGreaterThanOrEqual(
            section.words[section.words.length - 1].s,
          );
        }
      });

      it("every referenced mp3 exists in public/", () => {
        for (const section of manifest.sections) {
          const file = join("public", ...section.src.split("/").filter(Boolean));
          expect(existsSync(file), section.src).toBe(true);
        }
      });
    });
  }
});
