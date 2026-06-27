import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { DecisionTreeBreakIt } from "@/components/exhibits/DecisionTreeBreakIt";
import { DecisionTreeCheckLab } from "@/components/exhibits/DecisionTreeCheckLab";
import { DecisionTreeHero } from "@/components/exhibits/DecisionTreeHero";
import { DecisionTreeLab } from "@/components/exhibits/DecisionTreeLab";
import { DecisionTreeStory } from "@/components/exhibits/DecisionTreeStory";
import { decisionTreesCheck } from "@content/exhibits/decision-trees/concept-check";
import { decisionTreesFailures } from "@content/exhibits/decision-trees/failures";
import { decisionTreesMath } from "@content/exhibits/decision-trees/math";
import { decisionTreesNarrative } from "@content/exhibits/decision-trees/narrative";
import { decisionTreesSpine } from "@content/exhibits/decision-trees/spine";

export default function DecisionTreesExhibit() {
  return (
    <ExhibitFrame
      nodeId="decision-trees"
      narrative={decisionTreesNarrative}
      spine={decisionTreesSpine}
      math={decisionTreesMath}
      check={decisionTreesCheck}
      failures={decisionTreesFailures}
      breakIt={<DecisionTreeBreakIt />}
      checkCompanion={<DecisionTreeCheckLab />}
      hero={<DecisionTreeHero />}
      story={<DecisionTreeStory />}
      experiment={<DecisionTreeLab />}
      lede={
        <p>
          A decision tree predicts by asking a cascade of plain yes/no questions about one
          feature at a time. Each question cuts the plane with a straight, axis-aligned
          line, and the cuts assemble into a staircase of boxes that bends to any boundary
          — no feature engineering required.
        </p>
      }
      promise={
        <>
          You&apos;ll watch a staircase of cuts follow a curve no single line could — and
          watch the same freedom turn into overfitting you can see, as the tree grows a box
          around every noisy point.
        </>
      }
      experimentLede={
        <>
          One knob: tree depth. Drag it and watch the plane subdivide, the diagram sprout
          questions, and the train and held-out accuracy curves diverge — training to 100%,
          held-out peaking shallow and then falling.
        </>
      }
    />
  );
}
