# Audio-native prototype brief: Hear the gap

**Status:** Proposed first slice · **Decision:** Build next, as a reversible prototype inside the existing overfitting/regularization exhibit · **Mechanism:** overfitting only

## Why this mechanism

The first audio-native experiment should make one machine-learning mechanism perceptible: **overfitting begins when training fit keeps improving while performance on unseen data worsens**.

Overfitting is the best first candidate in the current repository:

- `overfitting-regularization` already has a deterministic polynomial fixture, train and held-out points, model-capacity evidence, and a verified visual treatment. The prototype can test the audio idea without inventing a second model or dataset.
- The present interface shows the train/test split and the curve well, but the learner still has to compare readouts or inspect a U-shaped chart. Sound can preserve both trajectories through time and make their separation noticeable without another visual panel.
- Loss is already rendered as geometry and contribution stacks; leakage is primarily about data provenance and order of operations; uncertainty does not yet have one equally mature, canonical experiment in this repository. Those are weaker places to test whether sound adds unique learning value.

Regularization may remain visible in the surrounding exhibit, but it is not part of this prototype's claim. The bounded experience ends when the learner identifies the onset of overfitting. It does not sonify ridge, lasso, bias–variance, uncertainty, or model selection.

## Core learner experience

The learner enters a compact instrument titled **Hear the gap**. A seeded dataset and polynomial fit use the same truth, prediction, and error grammar as the current exhibit.

1. The learner presses **Start sound**. This explicit gesture both explains the mapping and satisfies browser audio policy.
2. A **model complexity** control advances from a simple fit toward a highly flexible fit. The control may be dragged, stepped with arrow keys, or played as a slow, learner-controlled sweep.
3. Two concurrent but distinguishable voices report the same canonical state:
   - the **training voice** becomes calmer as training error falls;
   - the **held-out voice** first becomes calmer, then grows rougher as held-out error rises.
4. At first both voices improve together. At the turning point they separate. The learner can pause, scrub backward, and compare **before the gap** with **after the gap**.
5. The learner marks where they think overfitting begins. The interface reveals the held-out-error minimum and asks for one sentence: “What changed after this point?” Misconception-aware feedback distinguishes “the model got worse at fitting” from “the model kept fitting the training data while generalization worsened.”

The first payoff should arrive in under 45 seconds: the learner hears the separation, pauses, and names it.

## What sound contributes

Sound should not narrate the plot or turn numeric values into arbitrary pitches. It should expose a temporal relationship that is easy to miss when attention is on the changing curve:

- **Divergence through continuity.** The ear can retain two evolving streams while the eye inspects the fitted curve. The moment when one stream continues to settle and the other reverses becomes a perceptual event.
- **Peripheral monitoring.** The learner can manipulate complexity and look at the data while still noticing that held-out behavior has changed direction.
- **Reversible time.** Scrubbing across the turning point lets the learner compare the state immediately before and after it without reconstructing the history from a static chart.

The mapping must remain restrained and learnable. Error controls **roughness and pulse irregularity**, not emotional “good/bad” music. Training and held-out streams use different timbres and stereo position only as redundant cues. They remain identifiable in mono.

No claim should depend on sound alone. A synchronized error trace, numeric readouts, labels, and a text event log carry the same mechanism.

## Interaction and state model

### Controls

- **Start sound / Mute**: sound is off by default and never autoplays.
- **Complexity**: one canonical parameter, preferably polynomial degree from the existing deterministic fixture. Use discrete steps so each model state is reproducible.
- **Play / Pause / Step / Scrub**: reuse the lab's transport vocabulary. Playback is optional; direct manipulation is primary.
- **Solo training / Solo held-out / Both**: lets learners decode each stream before combining them.
- **Mark the turn**: records the learner's prediction without changing the model.
- **Reset**: returns to the seeded starting state and stops playback.

### Canonical state

One serializable state object owns every representation:

```ts
type OverfittingAudioState = {
  degree: number;
  trainError: number;
  heldOutError: number;
  heldOutMinimumDegree: number;
  transport: "stopped" | "playing" | "paused";
  audioEnabled: boolean;
  mix: "both" | "training" | "held-out";
  learnerMark?: number;
};
```

The model calculation updates this state. The curve, two error traces, readouts, event log, and audio engine derive from it. Audio must never run its own simulation or infer state from DOM animation.

### Coupling rules

- A degree change updates the visual and target audio parameters in the same event-loop turn.
- Audio parameters ramp over 40–80 ms to prevent clicks; the visual state changes immediately or with the existing `--motion-move` transition. Both settle on the same degree.
- Pausing freezes the current degree and both audio targets. Scrubbing updates both representations without restarting the sound graph.
- A reduced-motion preference disables automated sweeping and visual interpolation. It does not automatically disable sound; sound has its own explicit preference and control.
- Backgrounding the tab, leaving the stage, or unmounting the component suspends the audio context and stops transport.
- The event log records semantic transitions such as “degree 6: held-out error reached its minimum” and “degree 8: training error fell while held-out error rose.” It does not announce every slider tick.

## Audio design and asset strategy

### First slice: procedural, local, and deterministic

Use the Web Audio API to synthesize two modest voices in the browser. No generated music, sound library, runtime network request, or provider call is needed.

- Each voice uses a simple oscillator/noise/filter chain with conservative output gain and a hard master limiter.
- Normalize train and held-out errors against fixed bounds computed from the seeded degree sweep. Map normalized error monotonically to roughness and pulse irregularity. Keep pitch nearly fixed so the learner is not asked to decode a melody.
- Use a low, centered timbre for training and a slightly brighter timbre for held-out. A small left/right offset may reinforce labels, but timbre and the visible legend must do the identification in mono.
- Store the mapping as named pure functions with unit tests. Given the same state, it must produce the same audio parameters.

The sound is a data encoding, not a scientific measurement in itself. The UI must say that the mapping is designed to make relative change audible and that exact values remain in the readouts.

### Optional later voice assets

The repository's current narration pipeline uses build-time, committed assets with word timings and provenance in `audio-manifest.json`. If a later user request authorizes provider spending, ElevenLabs could produce at most three short orientation prompts: the mapping introduction, the turning-point reveal, and the reflection prompt. They must be separately scripted and must not speak continuously over the sonification.

For any generated clip, record provider, model, voice ID, settings, generation date, text hash, source text, and license/account basis. Commit the clip and manifest; never call TTS at runtime. The existing Gemini · Sulafat catalog narration remains untouched. ElevenLabs subscription availability is an opportunity for a later authorized comparison, not a reason to spend credits now.

No external credits or providers are used for this prototype plan.

## Bounded first slice

Build one representative interaction inside the existing `/exhibits/overfitting-regularization` route, preferably in **Run it** behind a clearly labeled experimental affordance. Reuse the existing fixture and polynomial model, but expose degree as the single control for this instrument.

Include:

- one seeded train/held-out dataset;
- degree steps sufficient to show underfit → best held-out fit → overfit;
- one fitted-curve view, paired error traces, two readouts, and the text event log;
- procedural training and held-out voices;
- explicit sound onboarding, solo/both controls, transport, scrub, reset, and “mark the turn” check;
- keyboard operation, mono compatibility, mute, captions/text alternative, reduced-motion behavior, and teardown when hidden;
- analytics only through the existing local learner store, if needed to record practice. No new backend.

Exclude:

- regularization controls or sonification;
- alternate datasets, user-uploaded data, microphone input, spatial/immersive audio, generative music, character voices, or adaptive narration;
- changes to the global exhibit spine, audio manifest schema, existing narration catalog, home page, or other exhibits;
- automatic personalization or claims that a learner has mastered the concept.

This is a prototype-quality representative slice: complete enough to experience and remove cleanly, not a new lab-wide audio framework.

## Accessibility and ethical constraints

- Sound starts only after an explicit user action. Remember mute locally only if the existing settings pattern supports it; never surprise the learner on a later page.
- All learning content and controls work with sound off. The text event log is the semantic equivalent of the sonification, not a generic “audio playing” caption.
- Provide visible focus, programmatic labels, full keyboard control, and a screen-reader group description that explains the two streams and current degree/errors without live-announcing every change.
- Use a polite live region only for the learner's marked-turn result and major semantic transitions. Throttle or suppress slider chatter.
- Do not rely on stereo, pitch discrimination, color, animation, or hearing acuity as the only cue. Test mono, common forms of color-vision deficiency, and at low volume.
- Keep output quiet by default, prevent clipping, avoid sudden transients, and include an always-visible mute. Do not use alarm-like sounds, sub-bass, or high-frequency tones.
- Do not describe auditory roughness as what overfitting “sounds like” in nature. State that this is an authored mapping of two error trajectories.
- Do not infer disability, attention, comprehension, emotion, or mastery from playback behavior. Do not use microphone data or biometric adaptation.
- Synthetic voice, if later authorized, must be disclosed as synthetic and must not imitate a real person without documented permission.

## Implementation shape

Keep the dependency footprint at zero.

- Add a focused client component such as `OverfittingAudioLab` beside the current exhibit components; do not alter shared narration behavior.
- Extract a small pure module for `degree → model/errors → normalized audio parameters`. The existing polynomial functions and fixture remain the numerical source of truth.
- Wrap Web Audio lifecycle in a local hook that creates the context only after **Start sound**, keeps stable nodes while parameters change, suspends on visibility loss, and closes on unmount.
- Render the curve with existing `Plot`, `PolyCurve`, `DataPoints`, semantic colors, tokens, panel treatment, and transport conventions. Use the current light surface and do not invent audio-specific visual colors.
- Prefer an inline SVG error trace using existing visualization primitives over adding a chart or audio library.
- Keep experimental code local until the representative slice proves useful. Extract shared sonification primitives only after a second mechanism demonstrates a stable reuse case.
- Read the installed Next.js guide relevant to the route and client-component boundary before implementation, as required by `AGENTS.md`.

No generated audio belongs in the first implementation. If authorized later, the build-time asset path must extend the current staleness and provenance checks rather than bypass them.

## Representative acceptance checks

### Mechanism and data integrity

- For every allowed degree, displayed train and held-out errors match direct calculations from the seeded fixture.
- The revealed turning point is the actual minimum held-out error over the allowed sweep, with ties handled deterministically.
- After the turning point, at least two consecutive steps in the chosen fixture show training error non-increasing while held-out error increases. If the fixture cannot guarantee this, the slice does not ship with that range.
- Fixed plot and error domains do not rescale during manipulation.

### Audio-visual coupling

- Unit tests prove both audio mappings are deterministic, bounded, monotonic with their respective normalized errors, and finite at every degree.
- Playwright changes degree by pointer and keyboard and verifies the curve, readouts, error trace, and text log reflect the same state.
- A development-only probe or injected test audio adapter confirms each degree update sends the expected parameter targets to both voices; automated tests do not judge subjective sound quality.
- Manual listening verifies the two streams can be identified separately, the divergence is noticeable without being startling, scrubbing does not click, and mono playback preserves the distinction.
- Switching tabs, changing stages, resetting, muting, and unmounting leave no playing or orphaned audio context.

### Accessibility and resilience

- The full prediction → manipulate → mark → explain loop is completable with audio disabled and by keyboard alone.
- Axe reports zero serious or critical violations in default, playing, marked, and muted states.
- Screen-reader review confirms concise labels and no slider-announcement flood.
- Reduced-motion mode removes autoplayed sweeping and unnecessary interpolation while preserving direct manipulation and sound controls.
- At 700 px and at the project's primary 1280 px width, controls, plot, traces, and transcript/event log remain usable without overlap or horizontal page scroll.

### Learning check

In a small human review, at least three representative learners can answer, after one pass: “Overfitting starts when training performance keeps improving but held-out performance gets worse.” Ask separately whether sound helped them notice the divergence sooner or merely decorated it. This is the validation gate; automated checks can only verify implementation.

Stop or redesign if learners cannot explain the mapping after soloing each stream, if the sound is tiring after 60 seconds, or if the visual-only path becomes second-class.

## Decision

**Build this next as the lab's first audio-native prototype.** It is narrow, reversible, and unusually well supported by the current code and visual standards. It tests a meaningful thesis: continuous sound can make a generalization gap perceptible while the learner manipulates and watches the model.

Do not spend the expiring ElevenLabs credits for the first slice. Procedural sound is both the more honest fit for the mechanism and the cheaper way to learn whether audio adds value. Request separate approval only if human review shows that a few spoken orientation prompts would materially improve comprehension; then run a small, provenance-tracked bake-off before generating any assets.
