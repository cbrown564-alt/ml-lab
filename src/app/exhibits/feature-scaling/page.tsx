import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { FeatureScalingBreakIt } from "@/components/exhibits/FeatureScalingBreakIt";
import { FeatureScalingCheckLab } from "@/components/exhibits/FeatureScalingCheckLab";
import { FeatureScalingHero } from "@/components/exhibits/FeatureScalingHero";
import { FeatureScalingLab } from "@/components/exhibits/FeatureScalingLab";
import { FeatureScalingStory } from "@/components/exhibits/FeatureScalingStory";
import { featureScalingCheck } from "@content/exhibits/feature-scaling/concept-check";
import { featureScalingFailures } from "@content/exhibits/feature-scaling/failures";
import { featureScalingMath } from "@content/exhibits/feature-scaling/math";
import { featureScalingNarrative } from "@content/exhibits/feature-scaling/narrative";
import { featureScalingSpine } from "@content/exhibits/feature-scaling/spine";

export default function FeatureScalingExhibit() {
  return (
    <ExhibitFrame
      nodeId="feature-scaling"
      narrative={featureScalingNarrative}
      spine={featureScalingSpine}
      math={featureScalingMath}
      check={featureScalingCheck}
      failures={featureScalingFailures}
      breakIt={<FeatureScalingBreakIt />}
      checkCompanion={<FeatureScalingCheckLab />}
      hero={<FeatureScalingHero />}
      story={<FeatureScalingStory />}
      experiment={<FeatureScalingLab />}
      lede={
        <p>
          Features measured on very different scales can make gradient-based optimization
          zig-zag and distance-based models let one variable dominate. Scaling puts features
          on comparable numeric ranges; it often improves conditioning, but it does not
          remove correlation.
        </p>
      }
      promise={
        <>
          You&apos;ll see how scale changes the optimization landscape, when standardization
          helps, and which models barely care about it.
        </>
      }
      experimentLede={
        <>
          Compare raw and standardized features on the same problem. Watch the path, safe
          learning-rate range, and condition number change—without assuming standardization
          always makes the surface perfectly round.
        </>
      }
    />
  );
}
