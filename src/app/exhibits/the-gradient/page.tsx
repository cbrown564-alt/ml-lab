import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { GradientBreakIt } from "@/components/exhibits/GradientBreakIt";
import { GradientCheckLab } from "@/components/exhibits/GradientCheckLab";
import { GradientLab } from "@/components/exhibits/GradientLab";
import { GradientStory } from "@/components/exhibits/GradientStory";
import { TheGradientHero } from "@/components/exhibits/TheGradientHero";
import { theGradientCheck } from "@content/exhibits/the-gradient/concept-check";
import { theGradientFailures } from "@content/exhibits/the-gradient/failures";
import { theGradientMath } from "@content/exhibits/the-gradient/math";
import { theGradientNarrative } from "@content/exhibits/the-gradient/narrative";
import { theGradientSpine } from "@content/exhibits/the-gradient/spine";

export default function TheGradientExhibit() {
  return (
    <ExhibitFrame
      nodeId="the-gradient"
      narrative={theGradientNarrative}
      spine={theGradientSpine}
      math={theGradientMath}
      check={theGradientCheck}
      failures={theGradientFailures}
      breakIt={<GradientBreakIt />}
      checkCompanion={<GradientCheckLab />}
      hero={<TheGradientHero />}
      story={<GradientStory />}
      experiment={<GradientLab />}
      lede={
        <p>
          To go downhill you first have to know which way is down — and on a surface over
          many variables, that&apos;s a real question. The gradient is the answer: one
          arrow that points the steepest way up, from anywhere.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll read a slope off a single arrow — its
          direction, its steepness, why it&apos;s square to the contour — and see exactly
          what gradient descent steps against.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Drag the point anywhere on the landscape and watch the gradient
          arrow swing to point uphill, stretch where it&apos;s steep, and vanish at a peak;
          flip to descent to see the step itself — then the maths of why underneath.
        </>
      }
    />
  );
}
