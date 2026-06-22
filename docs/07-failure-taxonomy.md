# Failure Taxonomy — the reusable "break it" catalogue

Most educational products teach the happy path: the algorithm, a clean dataset, the expected output, and an exercise that reproduces it. Practitioners spend their time everywhere else — validation collapse, misleading metrics, seed sensitivity, deployment mismatch, spurious features. **Making failure diagnosis a recognisable, reusable product primitive is one of the clearest ways ML Lab is more useful to a working engineer than a conventional visual explainer.**

This catalogue is the cross-Phase-1 source of truth for those primitives. Each exhibit's failure gallery composes `FailureCard`s (see [03-data-model.md](03-data-model.md)) whose `primitive` field is one of the ids below, so the *same* failure is recognisable wherever it recurs — and that recurrence is itself a teaching device (contrasting cases research: placing examples and non-examples together makes the structural difference visible).

## A failure card is not a list of caveats

Every entry is structured, and the structure is the pedagogy:

- **Trigger** — what the learner changes (sample size, feature scale, noise, class balance, seed, distribution).
- **Visible symptom** — the failure you can *see* (unstable boundary, misleading metric, diverging loss, brittle prediction).
- **Diagnosis prompt** — *what changed, and which assumption failed?*
- **Repair** — regularisation, rescaling, a better split, a different metric, a different model.
- **Boundary** — when the repair itself is the wrong move (so the learner does not cargo-cult the fix).

## The primitive ids (`FailurePrimitive`)

`small-samples` · `outliers` · `feature-scaling` · `collinearity` · `overfitting` · `data-leakage` · `class-imbalance` · `threshold-choice` · `distribution-shift` · `spurious-features` · `bad-initialisation` · `vanishing-exploding-gradients` · `seed-sensitivity` · `miscalibration` · `metric-gaming`

Ids are kebab-case and stable forever (like node ids). Add a new primitive here before referencing it from an exhibit.

## Catalogue

### `outliers` — a few points dominate a squared objective
- **Trigger**: drag one or two points far from the cloud (or raise their leverage).
- **Symptom**: the fit visibly swings toward the outliers; MSE is dominated by a couple of huge residual squares.
- **Diagnosis**: squared error penalises large misses quadratically, so high-error points outvote the crowd — is the model wrong, or is the *loss* mis-specified for this data?
- **Repair**: a robust loss (Huber/MAE), or removing/winsorising genuine errors.
- **Boundary**: outliers can be the signal (fraud, rare disease) — robustifying then *hides the thing you care about*.

### `feature-scaling` — unscaled features distort distance and curvature
- **Trigger**: multiply one feature's units by 1000 (km→mm) before fitting.
- **Symptom**: gradient descent zig-zags down a stretched valley and crawls; distance-based methods are dominated by the large-scale feature.
- **Diagnosis**: the loss surface is ill-conditioned because axes have wildly different scales — which step size could possibly suit both?
- **Repair**: standardise/normalise features (or use a scale-invariant method).
- **Boundary**: scaling leaks if fit on train+test together; tree models don't need it.

### `collinearity` — correlated features make coefficients unidentifiable
- **Trigger**: add a feature that is (nearly) a linear combination of existing ones.
- **Symptom**: coefficients swing wildly and flip sign with tiny data changes; huge standard errors; near-degenerate normal equations.
- **Diagnosis**: when features are linearly dependent, infinitely many weightings fit equally well — which one did the solver "choose," and why is it unstable?
- **Repair**: drop/merge features, or regularise (ridge) to pick a stable solution.
- **Boundary**: predictions can stay fine even when coefficients are uninterpretable — don't "fix" what you only need for prediction.

### `overfitting` — the model memorises noise
- **Trigger**: raise model capacity (polynomial degree, tree depth) past the signal.
- **Symptom**: training error keeps falling while validation error turns up; the curve wiggles through every point.
- **Diagnosis**: the model is fitting noise as if it were structure — which error (train vs held-out) is the honest one?
- **Repair**: regularisation, more data, fewer parameters, early stopping.
- **Boundary**: under-capacity is the opposite failure; "simpler is always better" is wrong when the true function is complex.

### `data-leakage` — information from the answer sneaks into the features
- **Trigger**: scale/impute using the whole dataset, or include a feature computed from the target.
- **Symptom**: implausibly good validation scores that collapse in production.
- **Diagnosis**: did any quantity the model saw at "train time" depend on information unavailable at prediction time?
- **Repair**: fit all transforms inside the training fold only; audit features for target provenance.
- **Boundary**: not every strong feature is leakage — domain signal can be legitimately predictive.

### `train-test` / `small-samples` — the held-out score is the only one that counts
- **Trigger**: shrink the sample, or evaluate on the training set.
- **Symptom**: training accuracy looks great and is meaningless; estimates swing run-to-run.
- **Diagnosis**: with few examples, the model can fit the particular sample, not the population — what would change on data it never saw?
- **Repair**: proper train/validation/test splits or cross-validation; report variance.
- **Boundary**: tiny test sets make the *estimate of generalisation* itself noisy.

### `class-imbalance` — accuracy flatters a lazy classifier
- **Trigger**: make one class 99% of the data.
- **Symptom**: 99% accuracy from "always predict majority"; the minority class is invisible.
- **Diagnosis**: which metric rewarded a model that learned nothing about the class you care about?
- **Repair**: precision/recall/PR-AUC, rebalancing/resampling, class weights, threshold tuning.
- **Boundary**: resampling distorts base rates and can wreck calibration.

### `threshold-choice` — one number turns scores into decisions
- **Trigger**: sweep the decision threshold on a probabilistic classifier.
- **Symptom**: precision and recall trade off; "the model's accuracy" changes with no change to the model.
- **Diagnosis**: the model outputs scores, not decisions — where does the operating point belong for *this* cost trade-off?
- **Repair**: choose the threshold from the cost matrix / ROC-PR curve, not the default 0.5.
- **Boundary**: a single threshold can't serve two populations with different base rates.

### `distribution-shift` — train and deployment disagree
- **Trigger**: shift the test distribution (new region, new time period).
- **Symptom**: a model that validated well degrades after deployment.
- **Diagnosis**: did the input/label distribution move out from under the model — covariate, label, or concept shift?
- **Repair**: monitoring, reweighting, retraining, domain adaptation.
- **Boundary**: chasing every drift over-fits to noise; some shift is benign.

### `spurious-features` — the model latches onto a coincidence
- **Trigger**: inject a feature correlated with the label only by accident of the sample.
- **Symptom**: strong in-sample performance riding a feature with no causal link.
- **Diagnosis**: is the predictive feature a *mechanism* or a *coincidence of this dataset*?
- **Repair**: causal/domain scrutiny, out-of-distribution tests, ablation.
- **Boundary**: correlation without causation can still be operationally useful — until the world changes.

### `bad-initialisation` & `vanishing-exploding-gradients` — the optimiser starts or descends badly
- **Trigger**: initialise weights too large/small; deepen the net; pick a hostile learning rate.
- **Symptom**: loss diverges to NaN or freezes; gradients explode or decay to zero through layers.
- **Diagnosis**: is the step size, the initialisation scale, or the depth responsible for the gradient's magnitude?
- **Repair**: principled init (Xavier/He), normalisation, gradient clipping, residual connections, a saner learning rate.
- **Boundary**: clipping/normalisation can mask a genuinely mis-specified model.

### `seed-sensitivity` — the result is an accident of randomness
- **Trigger**: change the random seed (init, shuffle, split).
- **Symptom**: "the result" moves materially between runs.
- **Diagnosis**: how much of the reported number is signal versus the luck of one seed?
- **Repair**: report mean ± variance over seeds; fix seeds for reproducibility.
- **Boundary**: a fixed seed hides instability — reproducible is not the same as robust.

### `miscalibration` — confident probabilities that aren't
- **Trigger**: read off predicted probabilities and compare to observed frequencies.
- **Symptom**: "90% confident" predictions are right 70% of the time.
- **Diagnosis**: does the score behave like a probability, or just an ordering?
- **Repair**: calibration (Platt/isotonic), proper scoring rules, reliability diagrams.
- **Boundary**: calibration can trade against discrimination; ranking-only uses may not need it.

### `metric-gaming` — optimising the proxy, not the goal
- **Trigger**: optimise hard for a single headline metric.
- **Symptom**: the metric climbs while real-world usefulness stalls or regresses (Goodhart).
- **Diagnosis**: is the metric a faithful proxy for the outcome, or has it become a target?
- **Repair**: multiple/guardrail metrics, slice analysis, human review.
- **Boundary**: too many metrics paralyse decisions — restraint cuts both ways.

## Cross-references

Failure primitives are also graph edges: a `fails_when` edge from a concept to the condition that breaks it (docs/03) lets the interface say *"learn regularisation next because the model you just built is unstable when features outnumber observations."* The taxonomy and the graph are two views of the same map.
