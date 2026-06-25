import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { GradientDescentBreakIt } from "@/components/exhibits/GradientDescentBreakIt";
import { GradientDescentCheckLab } from "@/components/exhibits/GradientDescentCheckLab";
import { GradientDescentHero } from "@/components/exhibits/GradientDescentHero";
import { GradientDescentLab } from "@/components/exhibits/GradientDescentLab";
import { GradientDescentStory } from "@/components/exhibits/GradientDescentStory";
import { gradientDescentCheck } from "@content/exhibits/gradient-descent/concept-check";
import { gradientDescentFailures } from "@content/exhibits/gradient-descent/failures";
import { gradientDescentMath } from "@content/exhibits/gradient-descent/math";
import { gradientDescentNarrative } from "@content/exhibits/gradient-descent/narrative";
import { gradientDescentSpine } from "@content/exhibits/gradient-descent/spine";

export default function GradientDescentExhibit() {
  return (
    <ExhibitFrame
      nodeId="gradient-descent"
      check={gradientDescentCheck}
      narrative={gradientDescentNarrative}
      spine={gradientDescentSpine}
      math={gradientDescentMath}
      failures={gradientDescentFailures}
      breakIt={<GradientDescentBreakIt />}
      checkCompanion={<GradientDescentCheckLab />}
      hero={<GradientDescentHero />}
      lede={
        <p>
          Gradient descent updates parameters by stepping against the gradient. The learning
          rate controls the step: too small is slow; too large can oscillate or diverge.
        </p>
      }
      promise={
        <>
          You&apos;ll connect the update rule to the path on the loss surface and diagnose
          whether a slow or unstable run is caused by step size, conditioning, or a flat
          region.
        </>
      }
      story={<GradientDescentStory />}
      experiment={<GradientDescentLab />}
      experimentLede={
        <>
          Play, pause, and scrub the optimization path. Change the learning rate and surface
          shape, then compare steady convergence, slow progress, oscillation, and divergence.
        </>
      }
    />
  );
}
