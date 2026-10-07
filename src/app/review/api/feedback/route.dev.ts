import type { NextRequest } from "next/server";
import { ScorecardSchema, RUBRIC_VERSION } from "@content/quality/rubric";
import { DecisionsSchema, DECISIONS_VERSION } from "@content/quality/decisions";
import {
  contentHash,
  isLive,
  readDecisions,
  readScorecard,
  readTextDoc,
  today,
  writeDecisions,
  writeScorecard,
  writeTextDoc,
} from "../../_lib/store";

/**
 * Read/write durable verdicts (docs/08 Part 3). GET returns the stored scorecard
 * + freeform notes + this-not-that decisions for an exhibit; POST stamps and
 * persists what the human rendered on the `/review` form. The verdict is the
 * file the autonomous loop reads back as ground truth (Part 4). Dev-only.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guard(): Response | null {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  return null;
}

export function GET(request: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;
  const exhibit = request.nextUrl.searchParams.get("exhibit");
  if (!exhibit || !isLive(exhibit)) return new Response("unknown exhibit", { status: 404 });
  return Response.json({
    scorecard: readScorecard(exhibit),
    notes: readTextDoc(exhibit, "notes.md"),
    decisions: readDecisions(exhibit),
    contentHash: contentHash(exhibit),
  });
}

export async function POST(request: NextRequest) {
  const blocked = guard();
  if (blocked) return blocked;

  const body = await request.json();
  const exhibit: unknown = body?.exhibit;
  if (typeof exhibit !== "string" || !isLive(exhibit)) {
    return new Response("unknown exhibit", { status: 404 });
  }

  if (typeof body.notes === "string") writeTextDoc(exhibit, "notes.md", body.notes);

  if (body.decisions && typeof body.decisions === "object") {
    // The form supplies the slots + chosen direction; the server stamps provenance
    // (which exhibit, when) and validates against the declarative schema before it
    // becomes ground truth the loop reads back.
    const stamped = {
      ...body.decisions,
      schemaVersion: DECISIONS_VERSION,
      exhibit,
      date: today(),
    };
    const parsed = DecisionsSchema.safeParse(stamped);
    if (!parsed.success) {
      return Response.json({ ok: false, issues: parsed.error.issues }, { status: 422 });
    }
    writeDecisions(exhibit, parsed.data);
  }

  if (body.scorecard) {
    // Stamp the provenance fields server-side: the form supplies the judgment
    // (register/hero/assessment/verdict), the server supplies the truth (who,
    // when, and the content hash this verdict is bound to — staleness ground).
    const stamped = {
      ...body.scorecard,
      schemaVersion: RUBRIC_VERSION,
      exhibit,
      reviewer: "human",
      date: today(),
      contentHash: contentHash(exhibit),
    };
    const parsed = ScorecardSchema.safeParse(stamped);
    if (!parsed.success) {
      return Response.json({ ok: false, issues: parsed.error.issues }, { status: 422 });
    }
    writeScorecard(exhibit, parsed.data);
  }

  return Response.json({ ok: true });
}
