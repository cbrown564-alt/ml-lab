"use client";

import { useState } from "react";

/**
 * Live consequence for the cnns param-count section: grow the image and watch the
 * dense layer's parameter count explode while the shared 3×3 filter stays at ten.
 * Pure arithmetic on the layer shapes — at n=8 the FC count is exactly the 2,340
 * the exhibit commits to elsewhere.
 */
export function ConvParamScale() {
  const [n, setN] = useState(8);
  const out = (n - 2) ** 2;
  const fc = n * n * out + out;
  const conv = 10;
  // Log scale: n=64 gives ~15.7M params (log10 ≈ 7.2).
  const fcWidth = Math.min(100, (Math.log10(fc) / 7.2) * 100);
  const convWidth = (Math.log10(conv) / 7.2) * 100;

  return (
    <div className="rounded-lg border border-line bg-sunken p-4">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor="conv-param-scale" className="text-sm font-medium text-ink">
          Image size
        </label>
        <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">
          {n}×{n}
        </span>
      </div>
      <input
        id="conv-param-scale"
        type="range"
        min={8}
        max={64}
        step={2}
        value={n}
        onChange={(e) => setN(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--accent)]"
        aria-label="Image size for the dense-versus-conv parameter comparison"
      />
      <div className="mt-4 flex flex-col gap-3">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
              Dense (flattened)
            </span>
            <span className="font-mono text-sm tabular-nums text-[var(--viz-error-ink)]">
              {fc.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-raised">
            <div
              className="h-full rounded-full bg-[var(--viz-error)]"
              style={{ width: `${Math.max(3, fcWidth)}%`, opacity: 0.8 }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
              One shared 3×3 filter
            </span>
            <span className="font-mono text-sm tabular-nums text-[var(--viz-truth-ink)]">
              {conv}
            </span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-raised">
            <div
              className="h-full rounded-full bg-[var(--viz-truth)]"
              style={{ width: `${Math.max(3, convWidth)}%` }}
            />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        Log scale. The dense layer pays n² × (n−2)² weights (plus biases); the shared
        filter never grows — {Math.round(fc / conv).toLocaleString()}× fewer parameters
        at {n}×{n}.
      </p>
    </div>
  );
}
