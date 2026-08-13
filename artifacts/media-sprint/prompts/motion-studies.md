# Silent motion-study prompts

## Optimizer settling loop

Eight-frame horizontal storyboard using the canonical teal sphere and layered cream basin. The sphere begins slightly up one wall, rolls through the center, overshoots gently, returns with diminishing motion, and settles. Locked camera and lighting; no squash-and-stretch or speed lines. The settled frame is the reduced-motion poster.

Review note: the generated sheet is useful for timing and pose reference but is not yet a seamless playable loop. The last-to-first transition still needs an animator or timeline tool.

## Next still-first study — Random Forests crowd settling

Preparation only · 2026-08-12. Do not submit either prompt yet. This note does not approve an asset for integration.

Generation update · 2026-08-12: `masters/motion-studies/random-forests-reference-still-v1.png` now exists with 20 markers in a 6/7/7 arrangement. It remains `generated`, not locked: the required three-reviewer ambiguity check and contextual crop review are still pending. The exact bounded prompt chain and file hash are in `masters/motion-studies/random-forests-reference-still-v1-metadata.md`. No Gemini job has been submitted.

Outcome update · 2026-08-13: the crowd-and-band direction did not produce controllable motion. Two manual attempts turned independent variation into synchronized swaying or turn-taking, and the aggregate band became a traveling wave. Retain its source files as failure evidence, but do not continue this direction.

The replacement vote-table direction uses `masters/motion-studies/random-forests-vote-table-still-v1.png`: eleven small blue/amber votes surround one larger blue result. A single-token motion return is preserved as `handoff/browser-video/returns/originals/ml-lab-video-004-random-forests-single-vote-original.mp4`, with its muted derivative and full review metadata beside it. The study is `reserve`, not approved: it isolated the intended token but returned at 4.010 seconds, included audio, introduced minor center-disc drift, and did not establish a clean loop.

### Why this is next

Random Forests is the highest-value next proof in the current queue:

- `manifest.json` records `random-forests-crowd-v1.png` as an advanced phase-two candidate, while the existing video batch has no remaining untried subject. Optimizer and Noise are already integrated provisionally; Attention is unsuitable and should not be retried before a different motion pattern is proven.
- The exhibit has a complete, stable narrative, guided story, experiment, and human scorecard. Its existing page can accept the same subordinate, learner-controlled placement pattern already exercised by the first two videos without changing product logic.
- Motion can test one precise explanatory idea already owned by the exhibit: individually different members fluctuate, while their collective band becomes steadier as the crowd grows. This is distinct from the previous force studies and does not require drawing exact trees, votes, boundaries, probabilities, or the claimed variance rate.
- The current source still is compositionally strong, but it is not adequate as the locked animation reference. The review log says its vane forms may read as leaves or boats. Animating that unresolved silhouette would amplify the ambiguity. Gradient Boosting also has an advanced still, but its tool changes identity between stages; Transformer risks reading as an architecture diagram; PCA's rotation and projection are better left to native graphics. Random Forests therefore has the best combination of source stability, placement readiness, and a correctable still.

### Intended learning purpose

The study should give a learner a qualitative preview of averaging: several small, visibly different contributions wobble independently, then a broad shared band settles and becomes less sensitive to any one contribution. It may support the prose about disagreement cancelling noise and the crowd becoming steady. It must not claim that the objects are literal trees, that the band is a computed decision boundary, that every error is independent, or that variance falls by a particular amount. The native guided story and experiment remain the technical evidence.

### GPT Image 2 reference-still workflow

1. Use `masters/exhibit-candidates/random-forests-crowd-v1.png` and `masters/force-reference-sheet-v1.png` as visual references, not as approved animation input.
2. Generate one art-directed 16:9 reference still in GPT Image 2. Request a wide, shallow-relief cut-paper scene with 18–24 simple upright **abstract vote markers**. Each marker should have the same unmistakable non-botanical silhouette: a narrow cream lozenge with a clipped flat top, a short straight foot, and one small blue or amber inset disc. Vary only lean angle and disc colour. Arrange the markers around a single broad, calm teal paper band whose smooth horizontal contour is clearly an aggregate backdrop, not water, a path, a chart, or a decision boundary. Keep generous warm near-white margins and a locked frontal three-quarter view. No leaves, boats, sails, trees, branches, nodes, arrows, labels, equations, axes, plots, UI, faces, limbs, glossy 3D, gradients, dark background, glow, or cinematic lighting.
3. Review the still at full size and at the intended desktop and mobile crop. Reject it immediately if three reviewers could reasonably name the markers as leaves, boats, sails, or literal trees; if the teal band reads as water or a plotted boundary; if inset colours imply correct/incorrect classes; or if individual silhouettes, count, camera, lighting, or material cannot plausibly remain fixed during animation.
4. If it passes, preserve the untouched master and generation metadata, record the exact prompt, and mark that single still `provisional-reference` in the media-sprint records. Lock its crop, object count, marker identity, palette, lighting, and material before writing values into the Gemini handoff. Do not combine multiple generated candidates into an invented reference.

### Gemini Omni prompt after the still is locked

Attach only the final locked GPT Image 2 still and use this prompt, replacing the bracketed count with the exact visible count from that still:

> Create one 10-second silent 16:9 motion study from the attached locked reference still. Preserve exactly the camera, framing, crop, [marker count] abstract vote markers, each marker's clipped-lozenge silhouette, foot, inset-disc colour, position family, matte cut-paper material, teal aggregate band, warm near-white ground, palette, lighting, shadows, and shallow relief. Begin in a calm version of the reference composition. Over the first three seconds, the markers make small independent lean adjustments with different timing and direction while remaining anchored to their own feet. From seconds three to seven, the teal band shows a few broad low-amplitude contour variations that progressively become smaller as the markers settle into a diverse but stable arrangement. Hold the final calm composition through second nine, then return gently to the exact opening pose by second ten so the last-to-first seam can be assessed. The motion is a qualitative metaphor for averaging many varied contributions into a steadier collective result; it is not a literal model visualization. Locked camera and lighting. No object additions, removals, morphing, collisions, synchronized marching, tree growth, wind, water motion, waves, arrows, labels, text, equations, axes, graphs, plotted points, decision boundaries, probabilities, numerical claims, UI, faces, limbs, mascots, dark sci-fi styling, neon glow, particles, dramatic depth of field, camera movement, cuts, logos, or watermark. Generate no speech, music, ambience, or sound effects. The opening/final calm frame must remain useful as the reduced-motion poster, and no explanatory fact may exist only in motion.

If the provider adds an audio track despite the request, preserve the original return for provenance but make only a muted derivative eligible for review. Do not treat silence removal, a plausible poster, or a nominal 10-second duration as evidence that the motion is technically or accessibly acceptable.

### Review decision

Review the still first, then review any later video through direct playback at normal speed, frame samples, actual duration, last-to-first seam, desktop crop, mobile crop, and reduced-motion poster. Apply one outcome:

- **Advance:** the still passes an unaided recognition check with at least three reviewers and none identifies the markers as leaves, boats, sails, or literal trees; the return is 9.9–10.1 seconds; marker count, identity, anchors, palette, camera, and lighting remain stable in sampled frames; marker motions start at different times and directions without exceeding a small lean; aggregate-band variation decreases without reading as water or an exact plotted result; side-by-side inspection of the last and first frames finds no positional jump; the opening/final poster communicates a calm crowd without motion; the file has no audible content or has a verified muted derivative; adjacent prose and the native experiment carry every technical claim; and desktop/mobile crops retain every edge marker without obscuring controls or text.
- **Reserve:** the central idea and visual identity survive, but one fixable production issue remains, such as a duration miss, visible seam, minor crop loss, small continuity drift, or removable audio. Reserve assets stay in `artifacts/media-sprint/` and are not integrated or described as approved.
- **Reject:** markers read as leaves, boats, sails, literal trees, agents, or a synchronized crowd; the teal band reads as water, a graph, a decision boundary, or measured model output; objects morph, multiply, disappear, collide, or change colour; motion implies guaranteed independence or a numerical convergence claim; the result uses labels/equations, generic sci-fi imagery, camera drama, or inaccessible motion-only teaching; or a stable reduced-motion poster cannot be extracted.

### Next manual action

Open GPT Image 2 and generate only the reference-still job above. Return the untouched image, exact prompt, provider/model metadata, and desktop/mobile review crops to `artifacts/media-sprint/` for a human advance/reserve/reject decision. Do **not** open Gemini Omni until one still is explicitly locked. If the still advances, copy its exact visible marker count into the prepared Gemini prompt and submit one bounded 10-second study; do not queue variants or another subject until that single return is reviewed.
