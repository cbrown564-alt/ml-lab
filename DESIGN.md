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
```

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

The page grammar is intentionally stable:

1. Graph-aware back link.
2. Domain and kind kicker.
3. Title and mastery badge.
4. Lede.
5. Narrative hook.
6. Experiment island.
7. Story sections.
8. Concept checks.
9. Field notes.
10. Builds on and Leads to graph links.
11. Honest construction/status note when needed.

Use generous vertical rhythm. The current system uses `mt-10`, `mt-12`, `mt-14`, and `py-16` for major sections. Keep prose narrow and experiments wider.

Experiment panels use a single raised container:

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
