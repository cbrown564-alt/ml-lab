import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { GradientBoostingBreakIt } from "@/components/exhibits/GradientBoostingBreakIt";
import { GradientBoostingCheckLab } from "@/components/exhibits/GradientBoostingCheckLab";
import { GradientBoostingHero } from "@/components/exhibits/GradientBoostingHero";
import { GradientBoostingLab } from "@/components/exhibits/GradientBoostingLab";
import { GradientBoostingStory } from "@/components/exhibits/GradientBoostingStory";
import { gradientBoostingCheck } from "@content/exhibits/gradient-boosting/concept-check";
import { gradientBoostingFailures } from "@content/exhibits/gradient-boosting/failures";
import { gradientBoostingMath } from "@content/exhibits/gradient-boosting/math";
import { gradientBoostingNarrative } from "@content/exhibits/gradient-boosting/narrative";
import { gradientBoostingSpine } from "@content/exhibits/gradient-boosting/spine";

export default function GradientBoostingExhibit() {
  return (
    <ExhibitFrame
      nodeId="gradient-boosting"
      narrative={gradientBoostingNarrative}
      spine={gradientBoostingSpine}
      math={gradientBoostingMath}
      check={gradientBoostingCheck}
      failures={gradientBoostingFailures}
      breakIt={<GradientBoostingBreakIt />}
      checkCompanion={<GradientBoostingCheckLab />}
      hero={<GradientBoostingHero />}
      story={<GradientBoostingStory />}
      experiment={<GradientBoostingLab />}
      lede={
        <p>
          Gradient boosting grows shallow trees in sequence, each one fit to the errors the
          ensemble still makes — the negative gradient of the loss. It is gradient descent
          run on the prediction itself: powerful enough to beat a single deep tree in a few
          rounds, and powerful enough to descend right past the signal into the noise.
        </p>
      }
      promise={
        <>
          You&apos;ll watch a sequence of weak trees descend the loss to a clean boundary —
          and watch the held-out loss bottom out and climb back up, the overfitting a forest
          never has.
        </>
      }
      experimentLede={
        <>
          One knob: the number of rounds. Drag it and watch the training loss sink toward
          zero while the held-out loss bottoms at the early-stop mark and then climbs — the
          overfit you can&apos;t read off the (flat) accuracy.
        </>
      }
    />
  );
}
