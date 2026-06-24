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
          How a model knows it&apos;s wrong — and why that choice quietly decides
          what it&apos;s willing to ignore. The loss is the judge; change the judge
          and the same data declares a different line &ldquo;best.&rdquo;
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll see why one cloud of points fits three
          different lines — and learn which judge to trust when a few points go rogue.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Switch the judge between squared, absolute, and Huber, drag
          the data or add your own points, and watch all three verdicts at once — then
          read the same losses as the maths underneath.
        </>
      }
    />
  );
}
