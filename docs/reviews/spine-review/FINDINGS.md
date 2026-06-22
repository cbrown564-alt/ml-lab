# Four-act spine — non-circular panel review (2026-06-22)

The review the user required **before scaling the template across the regression
cluster**. Three specialist sub-agents (`.claude/agents/`) judged the reworked
See·Run·Break·Explain spine + the interactive Break-it against the **stored exemplar
frames** (`docs/exemplars/`), not from memory.

## Verdict: NOT YET ready to scale — but the hardest part landed

| Act | Visual register (designer, vs named frames) | Pedagogy (teacher) |
| --- | --- | --- |
| Spine rail | **3** (guided journey, not restyled tabs) | — |
| ① See it | **3** | load-bearing |
| ② Run it | **3** (bench + math coordinated) | load-bearing; the η-cliff slider is exemplary |
| ③ Break it | **4 — exemplar-worthy** ("drives what Seeing Theory only shows") | the strongest feedback loop; teaches *diagnosis*, not spectacle |
| ④ Explain it | **2 — the laggard** (document-first, ~40% dead canvas) | sound instrument, but register regresses |

Both transfer items pass the can't-be-parroted bar. The interactive Break-it is the
clear win — the differentiator earns its name on both flagships.

## Blockers before scaling

1. **[FIXED] axe serious violation** — `aria-prohibited-attr` on the Explain-it
   difficulty-dot span (both flagships). Added `role="img"`. Re-verified: 0
   serious/critical on both Explain-it acts.
2. **[FIXED] GD Break-it diverged FitLine artifact** — when the step goes off the
   cliff the params blow up and the line snapped to a vertical glitch (a misleading
   dynamic, red-line-adjacent). Now hidden once `offTheCliff`, so the honest symptom
   is the exploding log loss curve. Re-verified visually.
3. **[OPEN — highest leverage, template-level] Explain it = 2.** It reverts to the
   document-first single column the redesign exists to kill. Compose it onto the
   canvas: pull the active check item left and bind the *relevant live instrument*
   into the wasted right column (answer against the live square / the live descent,
   not from memory). No act should ship with >25% horizontal dead canvas at 1440px.
4. **[OPEN — highest leverage, template-level] See it has no *committed* prediction.**
   Predict-then-verify lives only in Explain-it (two acts too late). The 0–2 min
   choreography beat is narrated but not enforced. Bake a lightweight commit-then-reveal
   into the See-it template (before the surface lifts / before the squares appear) so
   it scales **by construction** — otherwise the gap replicates into every exhibit.

## Off-4 polish (do before/with scaling; they bake into the template)

- Spine shows three nav affordances at once (act rail + "01/06" beat stepper + "ACT
  1/4" text) — collapse so a step is signalled once.
- Run-it maths sits below the bench in a 65ch column with an empty right margin —
  put the live widget beside its claim (Distill flanks equations with their
  consequence).
- LR Break-it should open with a committed guess like GD's, so both differentiator
  acts begin identically.
- Drag-reliability: the top-left See-it/Break-it point doesn't "wreck" when dragged
  up (it stays near the trend). Nudge the gate or the starting layout.
- Budgets near ceiling: linreg js 680/700, gd 687/700 — watch as exhibits grow.
- **Capture-harness bug (fix before the next review):** the tester's contact sheet
  shipped several frames byte-identical to the page-top hero (the "Run-it bench" /
  "Explain-it" frames were scrollY≈0). Assert distinct frame hashes + the act heading
  in-frame, so a review can never be judged against duplicated heroes.

## Standing decision

The template is **2 blockers fixed, 2 template-level blockers open**. Per the panel,
do not scale until Explain-it is composed onto the canvas (#3) and the committed
See-it prediction is baked into the template (#4) — both are once-and-for-all template
changes that every scaled exhibit then inherits for free.
