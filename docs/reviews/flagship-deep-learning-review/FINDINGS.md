# Flagship acceptance — the deep-learning cluster

**Date:** 2026-07-03
**Scope:** cnns · embeddings · attention · the-transformer · fine-tuning-vs-prompting-vs-rag — full four-act spines live at `interactive`, put before the non-circular review panel as the gate to flip the four hero nodes `interactive`→**flagship** (adaptation capstone targets **full**).

## The panel (non-circular: judged vs the stored exemplars in `docs/exemplars/`, not from memory)

Three agents (tester, designer-critic, teacher). Designer captures: `docs/reviews/captures/<id>/2026-07-03-designer/` (14 frames each).

### Designer-critic — visual register: **FAIL (first pass)** — 1 of 4 flagship nodes clears

| Exhibit | Hero | See | Run | Math | Break | Check | Clears 3? |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| cnns | ok | 1 | 2 | 2 | 2 | 2 | **NO** — blocker |
| embeddings | ok | 3 | 3 | 3 | 3 | 3 (soft) | **YES** |
| attention | void | 2 | 2 | 2 | 2 | 2 | **NO** |
| the-transformer | void | 3 | 2 | 3 | 3 | 2 | **NO (narrowly)** |
| fine-tuning-vs-prompting-vs-rag | void | 3 | 3 | 2–3 | 3 | 2 | **clears "full"** |

Key findings (every score frame-cited in the panel transcript):

1. **cnns BLOCKER** — the conv composite (INPUT GRID / FILTER / FEATURE MAP) only reflows in the full-width hero. In the ~760px stage column the FEATURE MAP `<svg>` lands at `right: 1632px` — 192px off the 1440 viewport — with FILTER overlapping the input grid. Recurs in See/Run/Break/Check (DOM-confirmed). Fix: scale-to-fit or stack sub-panels below hero width.
2. **attention** — the "token-aligned heatmap" shades only the active query row; 30/36 cells blank grey (vs `tensorflow-playground/00` fully-shaded output field). Hero fills under half the panel. Fix: shade the whole matrix, size to fill.
3. **the-transformer** — flagship-grade content (residual pathways visible, math beside consequence) but hero/Run-it bottom-right/Check voids hold three views at 2.
4. **Cross-cutting A: Explain-it companions under-scale** — top-right anchored with 330–600px dead air below (embeddings, attention, transformer, RAG) vs `seeing-theory-regression/01` full-column plot.
5. **Cross-cutting B: Math views document-first** — equations in the 65ch left column, right half empty (cnns, embeddings, transformer); foundations template put a live widget beside math.
6. **Cross-cutting C: hero voids** — attention/transformer/RAG heroes fill under half the panel (vs `distill-momentum/00` edge-to-edge).
7. **Grammar drift** — RAG metric hues change between table (Domain=blue, Fresh=amber) and Run-it bars (all purple); cnns rose feature-map hue sits in the Error-red family; embeddings categorical hues overload blue=prediction (confirm as documented extension).

Per-exhibit highest-leverage fixes: cnns → responsive composite; attention → shade full matrix + fill hero; transformer → fill canvases; RAG → unify metric hues; embeddings → scale Check companion.

### Teacher — pedagogy: **FAIL (first pass)** — 2 of 4 flagship nodes teach to the bar

| Exhibit | Verdict | Decisive reason |
| --- | --- | --- |
| cnns | **NOT YET** | Default slide lands on a zero cell — hero/story/lab read "OUTPUT 0.00" under "strong response" captions; ConvField overlap; only 1 triggerable failure (KernelLoop tab is static) |
| embeddings | **NOT YET** | Break-it "Analogy" tab is a *verify* mislabeled as a failure (`aria-label` says "failure to trigger"); needs a real second break (PCA-destroys-analogy). Transfer item is the cluster's model — strictly parrot-resistant |
| attention | **YES** | Heatmap + value-mix + peak-route all load-bearing; 2 genuine Break-it triggers; genuine long-range transfer. Nit: orphaned "bank" polysemy hook |
| the-transformer | **YES (one fix)** | Block flow + temperature genuine; stack-depth slider is near-decoration (copy admits it changes nothing visible) — give depth a visible payoff or reframe |
| fine-tuning-vs-prompting-vs-rag | **YES (full tier)** | Honest fixture discipline; 2 real triggers. Transfer is parrot-adjacent — acceptable at full |

**Cluster-level (owner decision):** no exhibit ships a code mode — docs/06 "code parity" and the mirrored-code choreography beat are unmet **by design** (framework-supported omission). Must be explicitly ratified (or code parity added) before the flagship flip; the rubric does not hard-floor it.

Teacher fix queue (leverage order): (1) ratify no-code-mode; (2) cnns defaults off the zero column — `spine.ts` midSlide 17→14, `experiment.ts` slide default 18→14, `CnnsHero.tsx` convState(0,1,17)→(0,1,14), cell (2,2)=2.10; (3) ConvField responsive; (4) cnns second trigger (kernel-size toggle in `KernelLoop`); (5) embeddings PCA-breaks-analogy trigger; (6) transformer stack-depth payoff; (7) minors — attention "bank" hook, cnns "2,304 vs 2,340" weight-count copy (2,340 already includes the 36 biases), template "Waiting on the experiment above" copy on Explain-it.

### Tester — integrity gate: **PASS** (all five exhibits, first pass)

Captures: `docs/reviews/captures/<id>/2026-07-03/` (20 frames each, incl. 1440×800 short-laptop pass — the k-means sticky-figure bug does **not** reproduce).

- **axe:** 20/20 views zero violations at any impact level; `e2e/a11y.spec.ts` 27/27.
- **Interaction smoke:** 66/66 affordances work; true input→paint 6–90ms everywhere (one first-pass 105–144ms reading isolated to Playwright per-step CDP dispatch overhead, reconciled with `steps:1` re-runs at 16–27ms).
- **Suites:** validate 0 errors/2 warnings (both = DL journeys missing `gradient-descent` hard prereq of `neural-network-fundamentals`) · vitest 313/313 · five cluster e2e specs 5/5 each in isolation · budgets: all 5 cluster routes ok (js 613/700, html 9/115); script exits 1 on 8 pre-existing out-of-cluster routes (Foundations/trees).
- **Red lines:** all CLEAR.
- **Open items for the panel:** (1) the journey prereq warnings; (2) Break-it default-state inconsistency — `CnnsBreakIt` opens healthy (trigger-first) while the other four open already-broken (repair-first); intentional per e2e, but a consistency call. (3) Pre-existing template-wide `ExhibitSpine` missing-key React warning (dev-only, inherited).

## Consolidated fix queue (designer × teacher, before re-review)

1. **ConvField responsive SVG** (`src/components/viz/ConvField.tsx` fixed `width={560}` vs `minmax(0,…)` grid) — designer blocker + teacher (b); lifts 4 cnns views.
2. **cnns zero-cell defaults** → slide 14 (spine/experiment/hero) — teacher (a).
3. **attention full-matrix heatmap** (all rows shaded, not just active query; 30/36 cells blank) + fill hero — designer.
4. **transformer canvas voids** (hero, Run-it bottom-right, Check companion) — designer.
5. **embeddings second triggerable failure** (PCA-breaks-analogy in Break-it) — teacher.
6. **cnns KernelLoop real trigger** — teacher.
7. **Cross-cutting: Explain-it companions fill column height** (embeddings/attention/transformer/RAG) — designer.
8. **Cross-cutting: Math views get a live widget beside equations** (cnns/embeddings/transformer) — designer.
9. **RAG metric-hue unification** (table vs bars) + hero balance — designer.
10. **transformer stack-depth payoff/reframe** — teacher.
11. Minors: cnns weight-count copy, attention "bank" hook, cnns rose feature-map hue, embeddings categorical-hue documentation.
12. **Owner ratification: no-code-mode tier decision** — cannot be closed by the loop.

## Fix pass (2026-07-03, commits ac9abdc → d3f8d3a)

1. **ConvField fluid** (ac9abdc) — GridPanel SVGs scale with their minmax tracks; DOM-probed max svg right 1294/1440 (was 1632).
2. **cnns firing defaults** (ac9abdc) — slide 14 = cell (2,2), fires 2.10 for both spine pairs; hero/story/lab all read 2.10 under "strong response".
3. **Attention full-matrix field** (ac9abdc) — continuous single-hue ramp over all 36 cells (kills the lavender runner-up drift); hero rebuilt as matrix + peak-route chip + value-mix bars; "Keys →" label collision fixed.
4. **Transformer canvases** (3797fa6) — hero = prefix+lg-bars | block-flow+P(mat) chip; Run-it flow chips grow to fill, bars in labeled panel; Check companion gets 1-vs-2-block P(mat) tiles (0.803→0.849 — stack-depth now has a visible payoff, teacher item 6).
5. **Embeddings fixture honesty + second trigger** (1d5faa5) — DISCOVERED: the co-occurrence features were compositional (queen = king−man+woman exactly), so PCA preserved the analogy at distance 0.0, falsifying the exhibit's claim. Regenerated with non-compositional counts (pca miss 1.29, guarded by generator assert + unit test); Break-it "Analogy" tab is now a genuine PCA trigger/repair loop with e2e.
6. **cnns KernelLoop trigger** (f6bb3d4) — swap stripes↔corner-block; peak |response| identical 2.10 on both (fixture-verified); trigger→symptom→repair with e2e.
7. **Copy** (f6bb3d4) — weight-count reconciled (2,340 parameters = 2,304 weights + 36 biases); attention "bank" orphan → fixture-grounded (sat hangs on cat).
8. **Check companions** (f6bb3d4) — embeddings: analogy-miss tiles (0.00/1.29) + overlay map; attention: 560px heatmap + ValueMixBar.
9. **Live math widgets** (d3f8d3a) — cnns conv-params scale (dense explodes to 922,500 at 32×32 vs constant 10); attention softmax-τ (committed sat row flattens to uniform 0.17). Budgets: cluster +2–5 KB js, failure set byte-identical to baseline 4362b0e (home/what-is-ml html fails are pre-existing — verified by rebuilding the baseline commit).

Not yet addressed (non-blocking polish): RAG metric-hue unification + hero balance, RAG Check companion, cnns rose feature-map hue, embeddings categorical-hue documentation, template "Waiting on the experiment above" copy, journey `gradient-descent` prereq warnings.

**Owner ratification (2026-07-12):** no-code-mode for this cluster — **waived** as N/A. Recorded as [docs/00-decisions.md](../../00-decisions.md) #007. Tracked follow-up: mirrored code for CNNs and attention first.

## Re-review (2026-07-12)

Fresh captures: `docs/reviews/captures/<id>/2026-07-12/`. Panel: tester · designer-critic · teacher.

### Tester — integrity: **PASS**

axe 27/27 · cluster e2e 27/27 · validate 0 errors · vitest 314/314 · DL route budgets all within ceiling · red lines CLEAR. (Budget script exit 1 remains pre-existing out-of-cluster routes.)

### Teacher — pedagogy: **PASS** (all five)

| Exhibit | Verdict |
| --- | --- |
| cnns | YES — slide-14 defaults, KernelLoop trigger, param-scale widget verified |
| embeddings | YES — honest PCA miss 1.29 + real Analogy trigger |
| attention | YES (upheld) |
| the-transformer | YES — stack-depth P(mat) payoff verified |
| fine-tuning-vs-prompting-vs-rag | clears **full** |

Code-parity unmet by design — waived under #007.

### Designer-critic — visual register: **PASS** (after CheckLab fix)

First re-review held cnns Explain at 2 (`OUTPUT 0.00` — CheckLab still hardcoded slide 17). Fix: `CnnsCheckLab` + `CnnsStory` fallback → `slideParam.default` (14); e2e pins Mass 25.20. embeddings / attention / the-transformer cleared register 3 on every surface. RAG clears **full** (hero/atmosphere/colour below 3 — held at interactive).

| Exhibit | Hero | See | Run | Break | Explain | Clears 3? |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| cnns | 3 | 3 | 3 | 3 | 3 | **YES** |
| embeddings | 3 | 3 | 3 | 3 | 3 | **YES** |
| attention | 3 | 3 | 3 | 3 | 3 | **YES** |
| the-transformer | 3 | 3 | 3 | 3 | 3 | **YES** |
| fine-tuning-vs-prompting-vs-rag | 2 | 3 | 3 | 3 | 2–3 | **full only** |

## Verdict

**GATE CLEARED.** Tester · teacher · designer all pass after the CheckLab slide fix and code-parity waiver. Four hero nodes advance `interactive`→**flagship**. Adaptation capstone stays `interactive` at content tier **full**.

Standing green at flip: validate 0 · vitest · 27 cluster e2e · DL budgets · `check:rubric --strict` · scorecards in `docs/reviews/feedback/{cnns,embeddings,attention,the-transformer}/`.
