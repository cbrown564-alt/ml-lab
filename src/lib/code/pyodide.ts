"use client";

/**
 * Lazy Pyodide loader (docs/00-decisions.md #001: Python-in-browser code
 * mode). The runtime (~6 MB wasm) loads from CDN only when a learner
 * actually runs code — never on page load, so performance budgets are
 * untouched. One load per session, shared by every exhibit.
 */

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export type PyodideRuntime = {
  runPython: (code: string) => unknown;
  setStdout: (options: { batched: (line: string) => void }) => void;
  setStderr: (options: { batched: (line: string) => void }) => void;
};

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideRuntime>;
  }
}

let runtime: Promise<PyodideRuntime> | null = null;

function injectScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.loadPyodide) return resolve();
    const script = document.createElement("script");
    script.src = `${PYODIDE_BASE}pyodide.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the Python runtime — check your connection."));
    document.head.appendChild(script);
  });
}

export function getPyodide(): Promise<PyodideRuntime> {
  runtime ??= injectScript().then(() => window.loadPyodide!({ indexURL: PYODIDE_BASE }));
  return runtime;
}
