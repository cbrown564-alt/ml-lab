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
          You can fit the training data perfectly — and still build a worse model.
          One knob, the model&apos;s flexibility, decides whether it&apos;s too stiff
          to see the shape or flexible enough to memorise the noise. The honest score
          is lowest in between.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll watch training error and test error part
          ways — and know why the best model is rarely the one that fits the data best.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Drag the degree from a stiff line to a frantic wiggle, watch
          the fit chase the training dots and miss the held-out rings, and read the
          U-shaped test error — then the bias–variance decomposition underneath.
        </>
      }
    />
  );
}
