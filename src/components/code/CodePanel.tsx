"use client";

import { useState } from "react";
import { getPyodide } from "@/lib/code/pyodide";

/**
 * Code mode v1 (docs/01-vision.md: visual + code modes everywhere). The
 * template is regenerated from the live experiment state, so the dataset in
 * the code is the dataset on the plot — the mirroring is the teaching
 * device. Editing the code claims it for the learner; the template stops
 * following until they reset. A plain textarea, deliberately: the editor is
 * not the product, the model is.
 */

type RunState = "idle" | "loading" | "running" | "done" | "error";

export function CodePanel({
  template,
  onRan,
}: {
  /** Python source mirroring the current experiment state. */
  template: string;
  /** Called after any successful run (mastery: running code is practice). */
  onRan?: () => void;
}) {
  // null = the learner hasn't taken the wheel: the live template shows,
  // following every change in the experiment. Editing claims the buffer.
  const [edited, setEdited] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [state, setState] = useState<RunState>("idle");
  const code = edited ?? template;
  const dirty = edited !== null;

  const run = async () => {
    setState((s) => (s === "idle" ? "loading" : "running"));
    setOutput([]);
    const lines: string[] = [];
    try {
      const py = await getPyodide();
      setState("running");
      py.setStdout({ batched: (line) => lines.push(line) });
      py.setStderr({ batched: (line) => lines.push(line) });
      py.runPython(code);
      setOutput(lines);
      setState("done");
      onRan?.();
    } catch (err) {
      setOutput([...lines, String(err)]);
      setState("error");
    }
  };

  return (
    <div>
      <textarea
        value={code}
        onChange={(e) => setEdited(e.target.value)}
        spellCheck={false}
        aria-label="Python code mirroring the experiment"
        rows={Math.min(24, code.split("\n").length + 1)}
        className="w-full resize-y rounded-lg border border-line bg-sunken p-4 font-mono text-sm leading-relaxed text-ink focus:border-accent focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={state === "loading" || state === "running"}
          className="rounded-full border border-accent px-5 py-1.5 text-sm font-medium text-accent hover:bg-accent hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "loading"
            ? "Loading Python…"
            : state === "running"
              ? "Running…"
              : "Run"}
        </button>
        {dirty && (
          <button
            type="button"
            onClick={() => setEdited(null)}
            className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted hover:border-ink-faint"
          >
            Reset to live data
          </button>
        )}
        {state === "loading" && (
          <span className="text-sm text-ink-faint">
            first run fetches the Python runtime (~6 MB, once per visit)
          </span>
        )}
      </div>
      {output.length > 0 && (
        <pre
          aria-live="polite"
          className={`mt-3 overflow-x-auto rounded-lg border p-4 font-mono text-sm leading-relaxed ${
            state === "error"
              ? "border-[var(--viz-error)] text-[var(--viz-error)]"
              : "border-line text-ink"
          }`}
        >
          {output.join("\n")}
        </pre>
      )}
    </div>
  );
}
