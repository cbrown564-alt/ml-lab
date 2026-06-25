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
          On a differentiable surface, the gradient collects one partial derivative per
          variable. It points in the direction of steepest local increase; its negative
          points toward steepest local decrease.
        </p>
      }
      promise={
        <>
          You&apos;ll read a gradient&apos;s direction and magnitude, see why it is
          perpendicular to a level curve at regular points, and learn why a zero gradient
          does not prove you found the best point.
        </>
      }
      experimentLede={
        <>
          Drag the point across the surface and watch the gradient change. Flip to descent
          to see a local step, then inspect what happens at peaks, valleys, saddles, and
          flat regions.
        </>
      }
    />
  );
}
