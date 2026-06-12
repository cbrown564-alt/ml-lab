import type { ExhibitNarrative } from "@/lib/narrative/schema";

export const linearRegressionNarrative: ExhibitNarrative = {
  nodeId: "linear-regression",
  hook: [
    "In 1885, Francis Galton plotted the heights of nearly a thousand adult children against the heights of their parents and noticed something odd: tall parents had tall children, but not quite as tall; short parents had short children, but not quite as short. To describe how strongly one number pulls on another, he drew a line through the cloud — and accidentally founded the most-used statistical tool of the next century.",
    "The question his line answers is everywhere once you see it. How much does another bedroom add to a flat's price? How much does an extra hour of revision move an exam score? One number, predicted from another, with a straight line as the claim. The experiment below puts that claim in your hands.",
  ],
  story: [
    {
      id: "the-claim",
      heading: "A line is a claim",
      paragraphs: [
        "Every straight line through the data is a little theory: every unit of x is worth this much y, starting from here. Two numbers — slope and intercept — and the theory is fully specified. The plot above shows the only such theory the data cannot improve on.",
        "But “cannot improve on” needs a judge. That judge is the set of dashed segments you toggled: the residuals, one per point, each measuring how far the theory missed reality — vertically, because x is taken as given and only the prediction of y is on trial.",
      ],
    },
    {
      id: "why-squares",
      heading: "Why squared error",
      paragraphs: [
        "The line you saw minimizes the sum of the residuals squared. Squaring does two jobs at once. It makes misses count regardless of direction — overshooting by 3 is exactly as bad as undershooting by 3. And it makes big misses count disproportionately: one residual of 10 outweighs ten residuals of 1, a hundred to ten.",
        "That second property is a personality trait, and you met its dark side in the outlier scenario. A single rogue point carries enough squared error to bend the line away from twenty-eight well-behaved ones. Squared error isn't wrong to do this — it is doing exactly what it was told. Whether that's what you wanted is a different question, and it's why other loss functions exist.",
      ],
    },
    {
      id: "what-best-bought",
      heading: "What “best” buys you",
      paragraphs: [
        "Choosing squared error has a famous reward: the best line can be computed directly, with a formula, no search required. Drag a point and the line snaps instantly to the new optimum — that snap is the formula at work. Most models you'll meet after this one offer no such formula; their best parameters must be searched for, step by step, downhill. That search has its own exhibit, and this line is where it starts.",
      ],
    },
  ],
  fieldNotes: [
    "In industry, linear regression is the baseline that fancier models must beat to justify their complexity — and embarrassingly often, they don't beat it by much.",
    "In science and economics, the slope is the headline: “an extra year of schooling is associated with X% higher earnings” is a regression coefficient speaking.",
    "Its failure mode travels too: the outlier sensitivity you just saw is why analysts inspect residual plots before trusting any fitted line.",
  ],
};
