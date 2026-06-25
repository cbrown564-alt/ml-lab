# Voice & Copy Style Guide

Canonical reference for learner-facing copy in ML Lab. Grounded in the June 2026 copy audit (`docs/ml-lab-copy-audit-report.pdf`). When prose, UI labels, or assessment feedback conflict with this guide, fix the copy — not the guide — unless the product deliberately changes direction.

## Product promise

**Build machine-learning intuition by running the model.**

The working sentence learners should feel everywhere:

> See the idea, change the inputs, push the model until it fails, then explain what happened.

This is clearer and more ownable than claiming to be an atlas, laboratory, museum, cabinet, and course alternative at once.

## Vocabulary

Use these terms consistently in **learner-facing** UI, navigation, mastheads, narratives, checks, and failure guides.

| Use | Meaning |
| --- | --- |
| **ML Lab** | The product name |
| **interactive lab** | The category (when you need one) |
| **exhibit** | One concept experience |
| **stage** | One of the four modes on an exhibit page |
| **journey** | A guided sequence through exhibits (e.g. Foundations) |
| **experiment** | The manipulable model surface in Run it |
| **progress** | What the learner has completed on an exhibit |

**Avoid in core UI copy** (even if visual design still evokes a collection):

| Avoid | Prefer |
| --- | --- |
| museum, atlas, cabinet, jewel, specimen | exhibit, collection, interactive exhibits |
| laboratory (as product identity) | ML Lab, interactive lab |
| bench, act, beat, pass | stage, section, step (internal code names may differ) |
| standing, mastery receipts, bench cleared | progress, checks complete |
| map (as navigation label) | browse all exhibits → `/#exhibits` |

Implementation components may keep internal names (`JewelGallery`, `SpecimenPlacard`). Learners should never have to decode a metaphor before learning the concept.

## The four stages

Every exhibit is worked through **four stages** (not “four passes”):

| Stage | Purpose line | What the learner does |
| --- | --- | --- |
| **See it** | Build a visual intuition. | Follow the guided story; watch the mechanism appear. |
| **Run it** | Change the inputs and inspect the model. | Drive the experiment; connect visuals to equations. |
| **Break it** | Trigger a failure and diagnose the cause. | Push past the edge; use the failure field guide. |
| **Explain it** | Apply the idea to a new case. | Answer checks; try transfer on an unseen scenario. |

### Default stage introductions

Use these when an exhibit does not override them:

- **Run it:** “Take control of the experiment. Change the scenario, edit the data, and move the controls. Then connect what you see to the equations underneath.”
- **Break it:** “Trigger the failure yourself. Watch the symptom, identify the cause, then repair it.”
- **Explain it:** “Use the live model and the checks below to test whether the idea transfers to a new case. You can revise an answer after seeing the feedback.”

**Banned openers:** “Guardrails off.” and “Stay twenty minutes…” — lively once, mannered fifteen times. Prefer exhibit-specific Run it intros on each `page.tsx`.

## Voice rule

**Be vivid about the interaction and conservative about the claim.**

| Good | Why |
| --- | --- |
| “Drag the threshold and watch recall fall.” | Concrete, testable, tied to the experiment. |
| “In this seeded example, R² ≈ 0.41.” | Honest about what the demo shows. |
| “Validation error often falls, then rises.” | Qualified generalization. |

| Avoid | Why |
| --- | --- |
| “Accuracy is meaningless.” | Broader than the evidence. |
| “A test gap proves leakage.” | A symptom prompts investigation; it is not a diagnosis. |
| “Standardization makes the bowl perfectly round.” | Demonstration-specific behavior stated as law. |

## Accuracy discipline

### Absolutes

Review and usually remove unjustified absolutes: *always, never, only, exactly, every, whole field, single most common, no model can*.

Replace with qualified language: *often, in this setup, can, may, tends to, in finite samples*.

### Demonstration vs theory

Separate what **this exhibit's simulation** does from what **holds in general**.

- ✅ “On this clean, roughly symmetric dataset, the three loss lines are nearly identical.”
- ❌ “On clean data the three lines are always identical.”

Label seeded numbers and fixture-specific behavior as such.

### Validation vs test

| Data role | Term |
| --- | --- |
| Choose degree, λ, capacity, threshold, or any model-setting | **validation** (or cross-validation) |
| Final untouched performance estimate | **test** |

Never call tuning data “test” in copy or UI labels.

### Probabilities and scores

Use **score** or **estimated probability** by default. Reserve **probability** and **calibrated** for cases where calibration is actually being taught or evaluated.

## Spelling & locale

**US English** throughout learner-facing copy:

- math, labeled, standardize, optimization, minimize, regularization, generalization, recognize, memorize

Internal British spellings in code comments are fine; ship US English in content.

## Assessment microcopy

| Element | Label |
| --- | --- |
| Unanswered item | Not answered |
| Correct item | Correct |
| Retry item | Try again |
| All items done | Checks complete |
| Section header | Progress |
| Experiment task done | Complete — the experiment registered it. |
| Transfer commit | Save my answer and compare |
| Failure gallery heading | Failure modes to recognize |
| Reproduce in lab | Reproduce it in Run it |

### Completion payoff

When all checks are complete, invite explanation — do not claim mastery was proven:

> All {n} checks complete. Before moving on, explain {concept} in your own words: what it does, when it helps, and one way it can fail.

Avoid: “you could now reconstruct this at a whiteboard,” “the mastery model has the receipts,” “prove transfer.”

Checks are **evidence of practice**, not proof of mastery.

## Masthead pattern

Each exhibit page carries three learner-facing strings (see any `src/app/exhibits/*/page.tsx`):

1. **Lede** — what the concept is, in plain language (1 short paragraph).
2. **Outcome** (`promise`) — what the learner will be able to do or recognize afterward.
3. **Run it intro** (`experimentLede`) — what to do first in the experiment, specific to this exhibit.

Do not repeat the global product promise in every masthead. Do not open Run it with theatrical framing.

## Homepage & navigation

- **Kicker:** Interactive machine-learning exhibits
- **Headline:** Build intuition by running the model.
- **Primary CTA:** Start with What Is Machine Learning → `/exhibits/what-is-ml`
- **Collection heading:** `{n} interactive exhibits` (not “Now showing · all open”)
- **Footer:** ML Lab — hands-on exhibits for building machine-learning intuition.
- **Journey exit:** Browse all exhibits → `/#exhibits`

## Editorial checklist (before ship)

Search each exhibit for stale patterns and review every hit in context:

- `Stay twenty minutes`
- `Guardrails off`
- `single most common`
- `always` / `never` / `only` / `exactly` / `whole field`
- `test error` where the value guides a choice (should be validation)
- `the honest score` (prefer validation error when selecting capacity)
- museum / atlas / cabinet / jewel in learner copy

Run `npm test -- content/exhibits` after narrative edits. Regenerate audio when story prose changes (`npm run audio`).

## Tone

Sophisticated, warm, concrete — *The Economist* meets *3Blue1Brown*. Second person when it helps the learner act. Short, vivid sentences. Field notes sound like a practitioner pointing out what matters in the wild.

Assume the learner is capable. No classroom theater, no condescension, no empty motivation.
