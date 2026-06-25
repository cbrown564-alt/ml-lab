import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { LossFunctionsBreakIt } from "@/components/exhibits/LossFunctionsBreakIt";
import { LossFunctionsCheckLab } from "@/components/exhibits/LossFunctionsCheckLab";
import { LossFunctionsHero } from "@/components/exhibits/LossFunctionsHero";
import { LossFunctionsLab } from "@/components/exhibits/LossFunctionsLab";
import { LossFunctionsStory } from "@/components/exhibits/LossFunctionsStory";
import { lossFunctionsCheck } from "@content/exhibits/loss-functions/concept-check";
import { lossFunctionsFailures } from "@content/exhibits/loss-functions/failures";
import { lossFunctionsMath } from "@content/exhibits/loss-functions/math";
import { lossFunctionsNarrative } from "@content/exhibits/loss-functions/narrative";
import { lossFunctionsSpine } from "@content/exhibits/loss-functions/spine";

export default function LossFunctionsExhibit() {
  return (
    <ExhibitFrame
      nodeId="loss-functions"
      narrative={lossFunctionsNarrative}
      spine={lossFunctionsSpine}
      math={lossFunctionsMath}
      check={lossFunctionsCheck}
      failures={lossFunctionsFailures}
      breakIt={<LossFunctionsBreakIt />}
      checkCompanion={<LossFunctionsCheckLab />}
      hero={<LossFunctionsHero />}
      story={<LossFunctionsStory />}
      experiment={<LossFunctionsLab />}
      lede={
        <p>
          A loss function turns prediction error into the number a model minimizes. Change
          that function and you change which mistakes matter most—and therefore which fit
          counts as best.
        </p>
      }
      promise={
        <>
          You&apos;ll compare squared, absolute, and Huber loss, then choose among them by
          the cost and plausibility of large errors.
        </>
      }
      experimentLede={
        <>
          Use the same dataset with three losses. Add or move extreme points and watch each
          fitted line respond, then inspect the penalty curves underneath.
        </>
      }
    />
  );
}
