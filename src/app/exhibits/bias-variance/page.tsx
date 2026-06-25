import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { BiasVarianceBreakIt } from "@/components/exhibits/BiasVarianceBreakIt";
import { BiasVarianceCheckLab } from "@/components/exhibits/BiasVarianceCheckLab";
import { BiasVarianceHero } from "@/components/exhibits/BiasVarianceHero";
import { BiasVarianceLab } from "@/components/exhibits/BiasVarianceLab";
import { BiasVarianceStory } from "@/components/exhibits/BiasVarianceStory";
import { biasVarianceCheck } from "@content/exhibits/bias-variance/concept-check";
import { biasVarianceFailures } from "@content/exhibits/bias-variance/failures";
import { biasVarianceMath } from "@content/exhibits/bias-variance/math";
import { biasVarianceNarrative } from "@content/exhibits/bias-variance/narrative";
import { biasVarianceSpine } from "@content/exhibits/bias-variance/spine";

export default function BiasVarianceExhibit() {
  return (
    <ExhibitFrame
      nodeId="bias-variance"
      narrative={biasVarianceNarrative}
      spine={biasVarianceSpine}
      math={biasVarianceMath}
      check={biasVarianceCheck}
      failures={biasVarianceFailures}
      breakIt={<BiasVarianceBreakIt />}
      checkCompanion={<BiasVarianceCheckLab />}
      hero={<BiasVarianceHero />}
      story={<BiasVarianceStory />}
      experiment={<BiasVarianceLab />}
      lede={
        <p>
          As model flexibility grows, training error usually falls. Validation error often
          falls at first, then rises when the model starts fitting noise. Bias and variance
          name the two pressures behind that trade-off.
        </p>
      }
      promise={
        <>
          You&apos;ll recognize underfitting and overfitting from train–validation behavior,
          then choose model capacity without touching the final test set.
        </>
      }
      experimentLede={
        <>
          Change polynomial degree and compare training with validation error. Watch the
          fitted curve move from too rigid to suitably flexible to overly sensitive.
        </>
      }
    />
  );
}
