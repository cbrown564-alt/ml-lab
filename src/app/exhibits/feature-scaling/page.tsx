import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { FeatureScalingLab } from "@/components/exhibits/FeatureScalingLab";
import { FeatureScalingStory } from "@/components/exhibits/FeatureScalingStory";
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
      story={<FeatureScalingStory />}
      experiment={<FeatureScalingLab />}
      lede={
        <p>
          A model that ignores units doesn&apos;t get the wrong answer — it takes a
          thousand steps to reach an answer it should have found in ten. Here&apos;s
          that slowness made visible on the loss surface, and the one-line fix.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll see why the same data can be easy or
          agonising to fit — and reach for the one preprocessing step that rounds the
          bowl.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Flip between raw and standardised units, play and scrub the
          descent, and read the condition number and step count change — then the
          conditioning maths underneath.
        </>
      }
    />
  );
}
