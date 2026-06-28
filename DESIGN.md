# DESIGN.md

## Design Direction

ML Lab uses a unified light design system. Narrative, assessment, code, and visual experiments all share one calm surface so exhibit pages feel continuous while learners move between explanation and manipulation.

The product is big-screen native. Design first for laptop and desktop widths, especially 1280 px and above. Mobile should remain usable and honest, but it is not the primary canvas.

## Scene Sentence

An adult learner studies on a laptop or desktop in a normal work or home environment, moving between prose, charts, controls, and code without wanting the page to change moods under them.

That scene calls for a warm, quiet light theme with strong semantic visualization colors and restrained interface chrome.

## Color Strategy

Restrained product palette with semantic visualization accents.

Use the tokens in `src/app/globals.css` as the source of truth. Current palette:

```css
--surface-bg: oklch(98.1% 0.009 76);
--surface-raised: oklch(99.3% 0.006 76);
--surface-sunken: oklch(94.5% 0.018 76);
--ink: oklch(21.8% 0.017 72);
--ink-muted: oklch(42.6% 0.026 72);
--ink-faint: oklch(50.8% 0.024 72);
--line: oklch(88.5% 0.023 76);
--accent: oklch(46.8% 0.091 190);
--accent-ink: oklch(98.6% 0.006 190);

--viz-prediction: oklch(54% 0.18 258);
--viz-truth: oklch(66% 0.145 75);
--viz-error: oklch(54% 0.17 8);
--viz-param: oklch(52% 0.16 303);
--viz-neutral: oklch(57% 0.025 245);

/* Same hues, darkened for body-text contrast (Stream 2, colour-into-prose) */
--viz-prediction-ink, --viz-truth-ink, --viz-error-ink,
--viz-param-ink, --viz-neutral-ink
```

The `--viz-*-ink` siblings carry the visual grammar into the prose: a key term
("the line", "residual", "the gradient") is tinted to match its mark on the
canvas. Use them only for the `-ink` (text) context — never as the only carrier
of meaning, so terms always pair the hue with weight and an underline.

Rules:

- Do not reintroduce a dark experiment surface.
- Use accent for primary actions, live/open states, and selected controls.
- Use `surface-raised` for panels and individual cards.
- Use `surface-sunken` for inactive chips, code/text areas, and subtle inset controls.
- Use `line` for structure, not decoration.
- Never use color as the only carrier of meaning.

## Visual Grammar

Visualization colors are semantic and lab-wide:

- Prediction: model fit, learned line, generated prediction.
- Truth: observed data, ground-truth labels, actual examples.
- Error: residuals, loss, divergence, incorrect states.
- Parameter: knobs, tunable hyperparameters, active parameter traces.
- Neutral: target/reference lines, secondary paths, inactive traces.

Do not invent per-exhibit color meanings unless the visual grammar is explicitly extended in the docs and tokens.

**Sanctioned extension — the two-class field (classification).** In the 2-D decision field and the decision-tree leaf pies, the two class labels read as **amber = class 0** and **blue = class 1** (amber from the Truth family, blue from the Prediction family), denoting *classes* rather than fit-vs-truth; a data point ringed in **Error red** is misclassified. This is a deliberate, lab-wide extension shared by every classification exhibit (logistic regression, decision trees, and the rest of the trees cluster) — reuse it rather than minting new class colors. Accuracy readouts that share a screen with the field must avoid these hues: train reads neutral, held-out reads accent.

## Typography

Use the existing Geist sans and Geist mono variables through Tailwind tokens.

Hierarchy:

- Home hero can use large display text, currently `text-6xl`, because it is the front door.
- Exhibit titles use `text-4xl`.
- Story section headings use `text-2xl`.
- Labels, kickers, status chips, and readouts can use the mono font sparingly.
- Body prose should stay around 65ch.

Rules:

- No fluid viewport-based font sizing.
- No negative letter spacing.
- Uppercase mono labels are acceptable for navigation metadata and section labels.
- Data readouts should be compact, tabular, and close to the graphic they describe.

## Layout

The product is canvas-first (Stream 2): the experiment is the protagonist, not a
figure inside an article. The page grammar:

1. Graph-aware back link.
2. **The specimen hero** — a wide, ambient portrait of the live object opens the
   exhibit before any chrome (`hero` slot, e.g. `LinearRegressionHero`). It shares
   the working experiment's visual grammar — the same truth-hued data, the same
   prediction-hued line — but stripped to a portrait: no axes, no readouts, no
   controls, set in the sanctioned panel (`rounded-xl border border-line
   bg-raised`) with a mono figcaption. On load it performs one *explanatory*
   motion (never decorative): for linear regression the line eases up from the
   flat baseline and settles into the fit. You meet the living thing, then read
   its tag. Like the placard, the slot is optional — an exhibit without one keeps
   the title-led masthead until it earns its own specimen.
3. **The masthead** — beneath the specimen, a two-column header. On the left the
   title, the lede, and a one-line **promise** of the payoff (the `promise` slot —
   often the failure mode this exhibit teaches), set off by an accent rule; this
   promise also balances the column against the placard's height, so the
   lower-left is invitation, not void. The **specimen placard** (`SpecimenPlacard`)
   sits on the right: the exhibit's catalogue record — classification (domain ·
   kind) and the learner's standing in the header, then Builds on / Leads to graph
   chips and the journey position — set in the same mono-label-over-data voice the
   live readouts speak. The masthead **orients** the learner in the graph before
   the interactive; the page's **forward** motion (continue the journey) lives at
   the foot. Orient at the top, advance at the bottom.
4. **The spine — See it · Run it · Break it · Explain it** (`ExhibitSpine`). The
   product promise *is* the page's structure: a prominent numbered four-stage rail
   (verb + one-line purpose per stage, Back/Next, arrow keys scoped to the rail) that
   the learner **advances through**. Label: "Work through four stages." Acts mount on
   first visit and stay mounted (state survives a detour); only the opening act is in
   the server HTML (budget honesty).
5. **The four stages**, each composed as its own graphic-led panel — never a reading
   column with a figure pinned in it:
   - **① See it — Build a visual intuition.** The guided visual story (`StoryStepper`):
     one persistent graphic the learner re-frames by *stepping* discrete beats (object
     constancy via `FrameContext` / `useActiveFrame`), prose + light direct
     manipulation beside it, a secondary beat rail within the stage. **Scroll reads, drag
     manipulates** — the two gestures never fight, and side-by-side holds to 700px so
     the graphic and its beat stay co-visible. The hook is the first beat; field notes
     close the walk.
   - **② Run it — Change the inputs and inspect the model.** *Coordinated representations*
     of one canonical state: the open **experiment** (scenarios, paint-your-own, the
     visual↔code toggle where the lab offers one) leads, then the same model's
     **mechanism in maths** beneath — *math beside its consequence* (pattern 5): equations
     set Unicode in the readouts' mono voice, key symbols tinted to their mark on the
     canvas via `HUE_INK`, and a live widget (`StabilityScale`, `SquaredPenalty`) where a
     claim has a live consequence. Default intro copy lives in `ExhibitFrame`; exhibits
     override with exhibit-specific `experimentLede` where helpful.
   - **③ Break it — Trigger a failure and diagnose the cause.** The differentiating stage.
     A live, guided failure loop the learner drives (`GradientDescentBreakIt`,
     `LinearRegressionBreakIt`): **trigger** past the edge, watch the **symptom** on the
     live canvas, **diagnose** the cause, then **repair** and watch recovery. Beneath the
     loop, the **field guide** (`FailureGallery`, `asFieldGuide`) catalogues failure modes
     as Trigger → Symptom → Diagnose → Repair → Boundary, each bound to a reusable taxonomy
     primitive (docs/07). Heading: "Failure modes to recognize."
   - **④ Explain it — Apply the idea to a new case.** The concept check as a graded
     instrument (a live "N of M" progress meter, each item in the catalogue voice),
     foregrounding the **transfer** item on an unseen case. Completion invites the learner
     to explain the idea in their own words — checks are evidence of practice, not proof
     of mastery. See docs/style/voice.md for assessment labels.

   Reading prose within a stage stays ~65–68ch. The page's only coda is the **journey
   strip** — a single hairline-ruled line (mono position left, next-stop affordance
   right), kept thin so the work stays the main event.

   *Rubric coverage (docs/06):* the spine is built so each acceptance-rubric area has a
   home — Hook / Manipulation / Causality in See it; Representation / Code-parity / Math
   in Run it; Failure / Diagnosis in Break it; Prediction / Transfer / Explain-it in
   Explain it.

**Identity — catalogue precision meets lab instrument.** The placard and the live
`StatGrid` readouts share one voice: precise mono uppercase micro-labels over
sans/data values in hairline-ruled cells. Visual design may suggest a curated
collection; learner-facing copy uses **exhibit**, **journey**, and **stage** — not
museum/atlas/cabinet metaphors (docs/style/voice.md).

The hero spans the full content width (`max-w-7xl`); prose elsewhere stays around
65–68ch. Use generous vertical rhythm: `mt-14`, `mt-24`, `py-16` for major
sections; beats are tall (`min-h-[68vh]`) so the sticky graphic stays pinned
through each.

Experiment panels use a single raised container, and that container is the unit
the spine pins:

```tsx
<div className="rounded-xl border border-line bg-raised p-6">
```

Cards are for repeated entries, exhibit panels, and assessment options. Do not nest cards inside cards.

## Components

### Buttons

Use rounded pills for current project consistency. Primary action:

```tsx
className="rounded-full bg-accent px-6 py-2.5 font-medium text-accent-ink"
```

Outlined action:

```tsx
className="rounded-full border border-line px-6 py-2.5 text-ink-muted hover:border-ink-faint hover:text-ink"
```

Experiment transport controls keep the same vocabulary: play, pause, step, step x10, scrub.

### Scenario Controls

Scenario buttons are pills. Active scenarios use accent fill. Failure scenarios may include a warning glyph in the label, but meaning must also appear in text.

### Chips

Graph and status chips are rounded pills with either accent border for live/open nodes or line border with sunken fill for inactive nodes.

### Experiment Panels

Panels should begin with scenario controls, then the scenario prompt, then mode controls if present, then the visual or code surface. Readouts sit immediately below the visual.

### Assessment Options

Concept-check options are raised, bordered rows. Selected and incorrect states must be distinguishable by border, text, and feedback copy, not color alone.

## Motion

Motion must explain state or interaction:

- Hover color changes on links, chips, and buttons.
- Small arrow movement on exhibit card hover.
- Training loops are learner-controlled with play, pause, step, and scrub.
- Respect `prefers-reduced-motion`.

Avoid decorative page-load choreography.

## Accessibility

The accessibility bar is WCAG 2.2 AA for shell surfaces and serious/critical axe violations at zero.

Rules:

- Visualizations use `role="img"` with teaching-point ARIA labels.
- Inputs have visible or programmatic labels.
- Direct manipulation must have a clear textual readout of the resulting state.
- Color is never the only encoding.
- Reduced motion is honored globally.

## Implementation Notes

- Style with Tailwind utilities and the global tokens.
- Keep global CSS truly global.
- Prefer shared visualization primitives in `src/components/viz`.
- Preserve fixed plot domains where interaction would otherwise reshape the axes under the learner.
- Use `ExperimentSpec` for datasets, scenarios, and parameters rather than hardcoding content in components.
- Update Playwright screenshots when intentional visual changes alter key states.

## Do Not Do

- Do not bring back dark mode for experiment islands.
- Do not add gradient text.
- Do not use decorative blobs, glass, or atmospheric backgrounds.
- Do not create a marketing landing page in place of the actual lab home.
- Do not hide incomplete sections. Say what is under construction.
- Do not make arbitrary one-off visualization colors.
- Do not add a heavy dependency for a simple chart or interaction without an ADR.

## Product Feel

The interface should feel calm, precise, and trustworthy enough for repeated study sessions. Visual design may evoke a curated collection; learner-facing copy stays direct — **exhibit**, **stage**, **journey** — so the experiment earns the memorable moment.
