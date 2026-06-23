import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The human-in-the-loop review surface (docs/08 Part 3). It reuses the lab's
 * design system but ships nothing to learners: it is **dev-only** — gated out of
 * any production build/static export — because it reads and writes review
 * artifacts on the local filesystem (`docs/reviews/`).
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ML Lab — Review",
  robots: { index: false, follow: false },
};

export default function ReviewLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8">
      <nav className="mb-8 flex items-center gap-4 text-sm">
        <Link href="/review" className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase transition-colors hover:text-ink">
          ML Lab · Review
        </Link>
        <span className="text-line">/</span>
        <Link href="/" className="text-ink-faint transition-colors hover:text-ink-muted">
          ← back to the lab
        </Link>
      </nav>
      {children}
    </div>
  );
}
