import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { RegularizationLab } from "@/components/exhibits/RegularizationLab";
import { RegularizationStory } from "@/components/exhibits/RegularizationStory";
import { overfittingRegularizationMath } from "@content/exhibits/overfitting-regularization/math";
import { overfittingRegularizationNarrative } from "@content/exhibits/overfitting-regularization/narrative";
import { overfittingRegularizationSpine } from "@content/exhibits/overfitting-regularization/spine";

export default function OverfittingRegularizationExhibit() {
  return (
    <ExhibitFrame
      nodeId="overfitting-regularization"
      narrative={overfittingRegularizationNarrative}
      spine={overfittingRegularizationSpine}
      math={overfittingRegularizationMath}
      story={<RegularizationStory />}
      experiment={<RegularizationLab />}
      lede={
        <p>
          When a model overfits, you don&apos;t have to make it simpler — you can make
          it pay. Regularisation keeps the over-powered model but penalises big
          weights, reining the wiggle into the smooth shape underneath without ever
          changing the degree.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll watch one penalty knob walk a frantic
          degree-12 curve from overfit, to just right, to crushed — and read the U it
          traces.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Slide the penalty λ across decades, watch the same degree-12
          model relax from wiggle to smooth and then go limp, and read the error-vs-λ U
          — then the ridge maths underneath.
        </>
      }
    />
  );
}
