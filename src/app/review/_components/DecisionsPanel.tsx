"use client";
/* eslint-disable @next/next/no-img-element -- dev-only review tool streaming local
   variant PNGs of arbitrary size; next/image optimization is wrong here. */

import { useState } from "react";
import {
  DECISIONS_VERSION,
  DECISION_KINDS,
  slotResolved,
  type DecisionKind,
  type DecisionSlot,
} from "@content/quality/decisions";
import { frameUrl } from "../_lib/frame-url";

/**
 * The "this, not that" surface, rebuilt as a declarative A/B chooser (docs/08
 * Part 3/6 — /review v2). One slot per below-floor register dimension arrives
 * pre-made; each holds competing renderings (copy / hero / graphic) and the human
 * just *picks* — the choice, the rejected candidates, and the reason persist as
 * `decisions.json`, which the loop reads back so a ruled-out direction is never
 * re-proposed. No decision is demanded where the bar is already cleared; the
 * actual candidate renderings are dropped in by the loop (or attached here).
 */
export function DecisionsPanel({
  exhibit,
  slots: initialSlots,
  variants,
}: {
  exhibit: string;
  slots: DecisionSlot[];
  /** docs-relative PNG paths under <capture>/variants/ — attachable as candidates. */
  variants: string[];
}) {
  const [slots, setSlots] = useState<DecisionSlot[]>(initialSlots);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update(id: string, patch: Partial<DecisionSlot>) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addCandidate(slot: DecisionSlot, value: string) {
    if (!value) return;
    const nextId = String.fromCharCode(65 + slot.candidates.length); // A, B, C…
    const candidate =
      slot.kind === "copy" ? { id: nextId, text: value } : { id: nextId, frame: value };
    update(slot.id, { candidates: [...slot.candidates, candidate] });
  }

  function removeCandidate(slot: DecisionSlot, candId: string) {
    update(slot.id, {
      candidates: slot.candidates.filter((c) => c.id !== candId),
      chosen: slot.chosen === candId ? null : slot.chosen,
    });
  }

  function addFreeSlot(kind: DecisionKind) {
    const n = slots.length + 1;
    setSlots((prev) => [
      ...prev,
      { id: `free-${kind}-${n}`, kind, prompt: `Free ${kind} decision`, candidates: [], chosen: null },
    ]);
  }

  async function save() {
    setState("saving");
    const res = await fetch("/review/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        exhibit,
        decisions: { schemaVersion: DECISIONS_VERSION, exhibit, date: "", slots },
      }),
    });
    setState(res.ok ? "saved" : "error");
  }

  return (
    <section className="mt-6">
      <p className="max-w-[68ch] text-sm text-ink-muted">
        One slot per dimension that scored <strong>below floor</strong> — pick the rendering that
        lifts it. The choice and the rejected candidates persist declaratively, so the loop never
        re-proposes a direction taste already ruled out. Nothing is forced where the bar is met.
      </p>

      {slots.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-line bg-sunken p-4 text-xs text-ink-faint">
          No below-floor dimensions — no decisions owed. Add a free decision below if you want to
          weigh a copy or composition alternative anyway.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          {slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              variants={variants}
              onChoose={(candId) => update(slot.id, { chosen: candId })}
              onWhy={(why) => update(slot.id, { why })}
              onRefs={(refs) => update(slot.id, { refs })}
              onAddCandidate={(v) => addCandidate(slot, v)}
              onRemoveCandidate={(candId) => removeCandidate(slot, candId)}
            />
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] tracking-wide text-ink-faint uppercase">
          add free decision
        </span>
        {DECISION_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => addFreeSlot(k)}
            className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted capitalize transition-colors hover:border-ink-faint hover:text-ink"
          >
            + {k}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={state === "saving"}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "Saving…" : "Save decisions"}
        </button>
        {state === "saved" && <span className="text-sm text-truth">Saved · the loop reads this back</span>}
        {state === "error" && <span className="text-sm text-error-viz">Save failed</span>}
      </div>
    </section>
  );
}

function SlotCard({
  slot,
  variants,
  onChoose,
  onWhy,
  onRefs,
  onAddCandidate,
  onRemoveCandidate,
}: {
  slot: DecisionSlot;
  variants: string[];
  onChoose: (candId: string) => void;
  onWhy: (why: string) => void;
  onRefs: (refs: string) => void;
  onAddCandidate: (value: string) => void;
  onRemoveCandidate: (candId: string) => void;
}) {
  const [copyDraft, setCopyDraft] = useState("");
  const [frameDraft, setFrameDraft] = useState("");
  const resolved = slotResolved(slot);

  return (
    <div className={`rounded-lg border p-4 ${resolved ? "border-truth/40" : "border-line"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-ink">{slot.prompt}</h3>
          <p className="mt-0.5 font-mono text-[10px] tracking-wide text-ink-faint uppercase">
            {slot.kind}
            {slot.dimension && ` · ${slot.dimension}`}
          </p>
        </div>
        <span
          className={`shrink-0 font-mono text-[10px] tracking-wide uppercase ${
            resolved ? "text-truth" : "text-ink-faint"
          }`}
        >
          {resolved ? `chose ${slot.chosen}` : "open"}
        </span>
      </div>

      {slot.candidates.length > 0 ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {slot.candidates.map((c) => {
            const chosen = slot.chosen === c.id;
            return (
              <div
                key={c.id}
                className={`overflow-hidden rounded-lg border transition-colors ${
                  chosen ? "border-truth ring-1 ring-truth" : "border-line"
                }`}
              >
                {c.frame ? (
                  <img src={frameUrl(c.frame)} alt={c.label ?? c.id} className="w-full bg-sunken" />
                ) : (
                  <p className="bg-sunken px-3 py-3 text-sm text-ink">{c.text}</p>
                )}
                <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onChoose(c.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      chosen
                        ? "border-truth bg-truth text-surface"
                        : "border-line text-ink-muted hover:border-ink-faint hover:text-ink"
                    }`}
                  >
                    {chosen ? `✓ ${c.id} chosen` : `Pick ${c.id}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveCandidate(c.id)}
                    title="remove candidate"
                    className="font-mono text-[10px] text-ink-faint hover:text-error-viz"
                  >
                    remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-xs text-ink-faint">
          No candidates yet — the loop will propose A/B renderings here, or attach one below.
        </p>
      )}

      {/* Attach a candidate by hand: a variant frame (hero/graphic) or text (copy). */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {slot.kind === "copy" ? (
          <>
            <input
              value={copyDraft}
              onChange={(e) => setCopyDraft(e.target.value)}
              placeholder="Add a copy alternative…"
              className="flex-1 rounded-md border border-line bg-raised px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint"
            />
            <button
              type="button"
              onClick={() => {
                onAddCandidate(copyDraft);
                setCopyDraft("");
              }}
              className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted hover:border-ink-faint hover:text-ink"
            >
              + add
            </button>
          </>
        ) : (
          <>
            <select
              value={frameDraft}
              onChange={(e) => setFrameDraft(e.target.value)}
              className="flex-1 rounded-md border border-line bg-raised px-2 py-1.5 font-mono text-xs text-ink-muted"
            >
              <option value="">Attach a variant frame…</option>
              {variants.map((v) => (
                <option key={v} value={v}>
                  {v.split("/").slice(-1)[0]}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!frameDraft}
              onClick={() => {
                onAddCandidate(frameDraft);
                setFrameDraft("");
              }}
              className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted hover:border-ink-faint hover:text-ink disabled:opacity-40"
            >
              + add
            </button>
          </>
        )}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          value={slot.why ?? ""}
          onChange={(e) => onWhy(e.target.value)}
          placeholder="Why this, not the others (the taste rationale)"
          className="rounded-md border border-line bg-raised px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint"
        />
        <input
          value={slot.refs ?? ""}
          onChange={(e) => onRefs(e.target.value)}
          placeholder="Refs (exemplar frame / principle)"
          className="rounded-md border border-line bg-raised px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint"
        />
      </div>
    </div>
  );
}
