/**
 * The one word-splitting contract, shared by the audio generator (timings),
 * the player (rendering), and the staleness test. Whitespace runs delimit
 * words; punctuation stays attached to its word. Kept dependency-free: the
 * player ships this to the client, and it must not drag the schema (zod)
 * along (C5 — the budget caught exactly that).
 */
export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Narration text of a section: its paragraphs as one spoken unit. */
export function sectionText(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}
