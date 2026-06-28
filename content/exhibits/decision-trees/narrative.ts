import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Decision trees as the other answer to "where's the boundary?" — picking up exactly
 * where logistic regression left off. The line couldn't follow a curve without being
 * handed x₁²; a tree asks a cascade of plain yes/no questions and carves the plane into
 * boxes that bend on their own. The twist the hands discover: the same freedom that
 * lets it chase the curve lets it memorize the noise. The maths (Gini, recursion)
 * arrives in Run it.
 */
export const decisionTreesNarrative: ExhibitNarrative = {
  nodeId: "decision-trees",
  hook: [
    "Here are two interleaving arcs of data — one class curling over the other. You just met the tool for this: logistic regression draws a boundary. But its boundary is a straight line, and no straight line follows this curve. Last node you rescued it by hand, inventing an x₁² feature so the line could bend. What if the model could bend on its own, without you engineering a thing?",
    "A decision tree does. It never solves for a line. It plays twenty questions with the data — \"is x₁ below this value? is x₂ above that?\" — and every yes/no answer slices the plane with one straight cut. Stack enough cuts and the staircase of boxes chases any curve you like. The power is real; so is the trap waiting at the bottom of it.",
  ],
  story: [
    {
      id: "one-cut",
      heading: "One question, one cut",
      paragraphs: [
        "Start with a single question. The tree scans every feature and every place it could split, and picks the one cut that best sorts the two classes apart: a vertical or horizontal line through the plane, with a predicted class on each side. That's a depth-1 tree — one question, two leaves, two boxes.",
        "One cut can't do much against two curving arcs — it lands the easy majority and gives up on the rest, the way a too-simple model always does. But notice what it did not do: it didn't search for a slope or solve any equation. It asked a yes/no question about one feature. The whole model is questions like that, stacked.",
      ],
    },
    {
      id: "the-staircase",
      heading: "Split, then split again",
      paragraphs: [
        "Now recurse. Take the points that fell on each side and ask the best next question of just them — splitting a split. Each new cut is again axis-aligned, but because it only governs its own box, the boundary as a whole turns a corner. Two levels of questions, four boxes; three levels, eight. The straight cuts assemble into a staircase, and the staircase bends to the curve the line never could.",
        "At a shallow depth this is exactly the boundary you wanted — the two arcs separated cleanly, the model right about points it has never seen. No feature engineering, no kernel, no x₁². Just questions, each one splitting the messiest box into two tidier ones.",
      ],
    },
    {
      id: "which-question",
      heading: "Which question is best?",
      paragraphs: [
        "What does \"best sorts them apart\" actually mean? The tree scores every candidate cut by how pure the two boxes it makes are. A box with only one class is perfectly pure; a fifty-fifty box is as impure as it gets. Gini impurity puts a number on that mess, and the tree greedily takes whichever cut drops the average impurity of the two children the most.",
        "That's the whole engine: at every box, try all splits, keep the one that buys the biggest gain in purity, recurse. No gradient, no learning rate — a greedy search for the next most useful question. Which raises the obvious temptation: if purer is better, why ever stop?",
      ],
    },
    {
      id: "grow-too-far",
      heading: "Grow it too far",
      paragraphs: [
        "Keep splitting and the tree will not stop until every box is pure — which, on noisy data, means drawing a tiny box around each stray point that wandered across the boundary. Training accuracy climbs to a perfect 100%. But the held-out score doesn't follow it up; the gap between the two yawns open, because those tiny boxes are memorizing flukes, not learning the shape.",
        "This is overfitting you can see — not a number in a table but a boundary gone visibly jagged, sprouting a few one-point islands in the other class's territory. The depth of the tree is its complexity knob, and the best held-out score sits at a shallow setting, not the deepest one. A tree's gift and its curse are the same thing: nobody told it where to stop.",
      ],
    },
  ],
  fieldNotes: [
    "A single tree is rarely the final model — it's the building block. Because one tree swings so wildly when the data shifts (high variance), practitioners almost always average many of them: a random forest votes across hundreds of trees, and gradient boosting grows them in sequence to fix each other's mistakes. Both are coming next; both are just trees, tamed.",
    "Trees read the way people think, which is their underrated superpower: every prediction is a path of plain questions you can recite — \"x₁ was below 0.4 and x₂ above 1.1, so class 1.\" When a stakeholder asks why the model decided what it did, a shallow tree can actually answer.",
  ],
};
