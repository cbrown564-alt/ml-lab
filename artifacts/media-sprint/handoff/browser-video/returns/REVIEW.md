# Manual Gemini video return review

All manual returns were preserved unchanged under `originals/`, remuxed without audio into stable review filenames, decoded successfully end to end, and sampled into contact sheets and poster frames under `review-frames/`.

| Job | Duration target / returned | Audio removed | Review |
| --- | --- | --- | --- |
| Optimizer | 10 s / 10.0 s | Yes | Reserve — strong motion/material; loop seam not established |
| Noise | 10 s / 6.0 s | Yes | Reserve — useful source; duration miss and seam need review |
| Attention | 10 s / 6.0 s | Yes | Reserve — clear routing; duration miss and prohibited arrowheads |
| Random Forests single vote | 10 s / 4.010 s | Yes | Reserve — intended token is isolated; duration, seam, audio, and minor center-disc drift prevent advancement |

## Integration decision · 2026-08-10

- Optimizer: integrated provisionally after the exact Gradient Descent guided story. It is silent, poster-first, learner-controlled, and does not loop; the unresolved seam therefore cannot misrepresent it as a finished loop.
- Noise: integrated provisionally after the exact Overfitting & Regularization guided story. It is silent, poster-first, learner-controlled, and presented at its actual six-second duration.
- Attention: unsuitable for product use because of prohibited arrowheads. The returned video remains in the reserve; the reviewed `attention-routing-v1.png` source still is the integrated fallback.
- Random Forests: reserve only. The single amber-token lift is legible and does not alter the stable blue result, but the return is four seconds, contains provider audio, has minor unintended center-disc rotation, and does not establish a clean seam. Keep the original source still, untouched provider return, muted derivative, and review record; do not integrate or loop it.

Only muted review copies were copied into `public/`; originals remain here. Every placement labels the media as a generated visual metaphor and points learners back to the live experiment for exact behavior and measurements.
