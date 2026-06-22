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
4. **The story stepper** (`StoryStepper`) — the guided story as discrete beats you
   *step* through, not a scroll spine. One persistent graphic holds the right; the
   current beat's prose + controls + readouts hold the left; a beat rail with
   Prev/Next (and arrow keys, scoped to the rail) advances. Object constancy
   survives — stepping re-frames the one graphic through `FrameContext` (which the
   lab reads with `useActiveFrame()`) rather than replacing it — but the two
   gestures separate: **scroll reads, drag manipulates**, so manipulation never
   fights a scroll-driver. The hook is the first beat; **field notes** (where the
   concept lives in the wild) close the walk as a final step over the calm at-rest
   graphic. Side-by-side holds down to 700px (half a wide monitor), so the graphic
   and its beat stay co-visible — the scroll spine's half-screen failure (the
   sticky graphic collapsing out of sight) is designed out. This is the
   Seeing-Theory / Distill model: our two nearest exemplars keep the graphic and
   its explanation co-visible and advance by choice, not scroll. The whole story
   fits ~one screen, and the stepper is the page's end — nothing scrolls below it
   but the journey strip.
5. The deeper layers are **switchable views**, each composed as its own act — not
   a reading column with a figure pinned in it (the story stepper set this bar; the
   others now meet it):
   - **Math** is *math beside its consequence* (pattern 5). Equations are set
     Unicode in the mono voice the readouts speak, with key symbols tinted to their
     mark on the canvas (η in the param hue, the miss ŷ−y in error-red) through the
     shared `HUE_INK`. Where a claim has a live consequence it earns a self-contained
     widget in the lab's instrument voice: `StabilityScale` (drag a learning rate
     across the divergence cliff) and `SquaredPenalty` (drag a miss and watch the
     penalty grow as an area, r→r²). A widget is *explanatory*, never decorative —
     it turns a stated number into one the reader can cross.
   - **Experiment** is *the open bench* — the same instrument from the story with
     the guardrails off. Its framing line names what the bench actually holds, so it
     never promises a mode the lab lacks.
   - **Break it** is the failure gallery (optional, present when an exhibit carries
     one): structured diagnostic cards — Trigger → Symptom → Diagnose → Repair →
     Boundary — each bound to a reusable failure-taxonomy primitive (docs/07). It is
     the "Break it" beat of the product promise (See it · Run it · Break it · Explain
     it), and it makes failure diagnosis a recognisable, reusable surface rather than
     a list of caveats. The error hue marks the symptom; the diagnosis is posed as a
     question (the active-learning step).
   - **Check** is a *graded instrument*: a live "N of M resolved" meter, each item
     carrying its kind / difficulty / status in the catalogue voice, and a closing
     payoff panel that ties the mastery just earned to the next journey stop. The
     learning loop is our edge over the benchmark set, so it earns real presentation.

   Reading prose within these views stays ~65–68ch. The page's only coda is the
   **journey strip** — a single hairline-ruled line (mono position left, next-stop
   affordance right), kept thin so the story stays the main event.

**Identity — museum catalogue meets lab instrument.** The placard and the live
`StatGrid` readouts share one voice: precise mono uppercase micro-labels over
sans/data values in hairline-ruled cells. The masthead record and the live
estimates strip read as the same instrument. That precise, catalogued register —
not warm-serif, not dark-acid, not broadsheet — is the lab's signature.

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

The interface should feel like a quiet interactive museum for machine learning: warm, precise, and roomy. The page should disappear enough for the learner to focus, while the experiment earns the memorable moment.
