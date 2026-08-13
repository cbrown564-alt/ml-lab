# Random Forests reference still v1 — generation record

- Date: 2026-08-12
- Capability: built-in image generation, GPT Image 2 path
- Status: `generated`; pending the three-reviewer ambiguity check in `prompts/motion-studies.md`
- Master: `random-forests-reference-still-v1.png`
- Dimensions: 1672 × 941 RGB PNG
- SHA-256: `850b04015ea4d8806a4c7a3171ce685861511f49e3391c1bb8a938e190312b7a`
- Source references: `../exhibit-candidates/random-forests-crowd-v1.png` and `../force-reference-sheet-v1.png`
- Review derivatives: `../../review-frames/random-forests-still-v1/desktop-1440x810.png` and `../../review-frames/random-forests-still-v1/mobile-640x360.png`
- Submission state: no Gemini submission and no video generation

The selected master is the third result in a bounded generate-and-correct sequence. The first result had 22 markers and a pool-like teal field. The second corrected the count and teal material but was too regimented. The third introduced restrained independent lean and irregular disc colours while preserving 20 markers and the three paper strips.

## Initial generation prompt

```text
Use case: stylized-concept
Asset type: provisional 16:9 reference still for a later silent ML Lab motion study
Input images: Image 1 is a composition reference only and must be redesigned to remove its leaf/boat/sail ambiguity; Image 2 is the exact reference for matte cut-paper material, restrained palette, warm near-white ground, shallow relief, crisp edges, and adult editorial tone.
Primary request: Create one wide, art-directed abstract still that qualitatively suggests many varied contributions forming a steadier collective result. Show exactly 20 simple upright abstract vote markers. Every marker uses the same unmistakably non-botanical silhouette: a narrow vertical cream lozenge with a clearly clipped flat top, subtly straight side edges, a short straight rectangular foot, and exactly one small inset paper disc in blue or amber. Vary only each marker's modest lean angle and inset-disc color. Arrange the markers in three shallow staggered rows around one broad, calm teal cut-paper aggregate band. The band must be a flat layered backdrop with a smooth horizontal contour, not a river, water surface, road, plotted curve, decision boundary, or chart.
Composition/framing: landscape 16:9, locked frontal three-quarter view, subject centered with generous warm near-white margins, all edge markers fully visible, enough separation to count and preserve every marker during animation.
Style/medium: precision matte cut-paper relief, shallow physical depth, crisp hand-cut edges, fine paper grain, restrained serious science-magazine register.
Lighting/mood: soft even studio light, very shallow consistent shadows, calm and analytical.
Color palette: cream paper markers, restrained teal aggregate band, small blue and amber inset discs, warm near-white ground.
Constraints: exactly 20 markers; fixed repeated non-botanical marker identity; no text; no labels; no equations; no axes; no UI; no technical claims. The still must remain legible as a reduced-motion poster.
Avoid: leaves, petals, plants, boats, sails, trees, branches, nodes, arrows, characters, faces, limbs, mascots, synchronized crowd behavior, waves, water, roads, graphs, plotted points, decision boundaries, glowing networks, generic sci-fi imagery, neon, gradients, glossy 3D, dramatic shadows, depth-of-field blur, dark backgrounds, logos, watermark.
```

## Count and aggregate correction prompt

```text
Use case: precise-object-edit
Asset type: provisional 16:9 reference still for a later silent ML Lab motion study
Primary request: Correct only the marker count and teal aggregate shape in the supplied still.
Required edits: Show exactly 20 cream vote markers total, arranged as 6 markers in the back row, 7 in the middle row, and 7 in the front row. Remove the extra markers cleanly and rebalance spacing. Replace the large rounded teal field with a substantially narrower horizontal stack of three thin teal cut-paper strips, aligned behind the middle row, with gently different but mostly straight upper edges. The strips must read as layered paper aggregation, never as water, a pool, a road, a track, a graph, or a decision boundary.
Invariants: Preserve the existing marker identity exactly: narrow vertical cream lozenge, clipped flat top, subtly straight side edges, short rectangular foot, exactly one blue or amber inset disc. Preserve matte paper grain, warm near-white ground, restrained teal/blue/amber palette, soft even studio light, shallow shadows, frontal three-quarter camera, landscape 16:9 crop, generous margins, and calm adult editorial register. Keep every marker fully visible and separated.
Constraints: exactly 20 markers, exactly one inset disc per marker, no text, labels, equations, axes, UI, technical claims, logos, or watermark.
Avoid: leaves, petals, plants, boats, sails, trees, branches, nodes, arrows, characters, faces, limbs, mascots, waves, water, roads, tracks, charts, plotted points, decision boundaries, glow, sci-fi styling, gradients, glossy 3D, dramatic shadows, blur, dark backgrounds.
```

## Final diversity correction prompt

```text
Use case: precise-object-edit
Asset type: final candidate reference still for a later silent ML Lab motion study
Primary request: Keep the exact 20-marker composition and three teal aggregate strips, but make the crowd quietly diverse instead of regimented.
Required edits: Preserve exactly 20 markers in three rows of 6, 7, and 7. Give each marker a small individually chosen lean angle between about 2 and 7 degrees, mixing left, right, and near-upright poses; every foot stays firmly anchored and flat. Stagger horizontal spacing slightly within each row while keeping generous separation and every marker fully visible. Redistribute blue and amber inset discs irregularly rather than alternating, while keeping exactly one disc per marker. Keep the final arrangement calm and stable, not chaotic or synchronized.
Invariants: Preserve the exact clipped-top cream lozenge marker silhouette, short rectangular feet, marker count, three narrow layered teal paper strips, warm near-white ground, matte cut-paper grain, restrained palette, soft even lighting, shallow shadows, landscape 16:9 framing, and generous margins. The teal strips remain mostly straight layered paper aggregation, not water, road, track, graph, or decision boundary.
Constraints: exactly 20 markers; 6 back, 7 middle, 7 front; exactly one inset disc per marker; no text, labels, equations, axes, UI, technical claims, logos, or watermark.
Avoid: perfect grid, strict color alternation, large tilts, falling markers, leaves, plants, boats, sails, trees, branches, arrows, characters, faces, limbs, mascots, water, waves, roads, tracks, charts, plotted points, decision boundaries, sci-fi glow, gradients, glossy 3D, dramatic shadows, blur, dark backgrounds.
```
