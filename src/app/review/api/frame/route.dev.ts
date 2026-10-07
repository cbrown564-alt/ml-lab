import { readFileSync } from "node:fs";
import type { NextRequest } from "next/server";
import { resolveFrame } from "../../_lib/store";

/**
 * Serves a review frame (capture or exemplar PNG) from docs/ — these live
 * outside public/, so the review surface streams them through a sandboxed
 * handler instead of copying pixels into the learner build. Dev-only.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }
  const docsRelPath = request.nextUrl.searchParams.get("path");
  if (!docsRelPath) return new Response("missing ?path", { status: 400 });

  const abs = resolveFrame(docsRelPath);
  if (!abs) return new Response("frame not found", { status: 404 });

  const buf = readFileSync(abs);
  return new Response(new Uint8Array(buf), {
    headers: { "content-type": "image/png", "cache-control": "no-store" },
  });
}
