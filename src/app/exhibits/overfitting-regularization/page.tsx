import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { RegularizationBreakIt } from "@/components/exhibits/RegularizationBreakIt";
import { RegularizationCheckLab } from "@/components/exhibits/RegularizationCheckLab";
import { RegularizationLab } from "@/components/exhibits/RegularizationLab";
import { RegularizationHero } from "@/components/exhibits/RegularizationHero";
import { RegularizationStory } from "@/components/exhibits/RegularizationStory";
import { overfittingRegularizationCheck } from "@content/exhibits/overfitting-regularization/concept-check";
import { overfittingRegularizationFailures } from "@content/exhibits/overfitting-regularization/failures";
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
      check={overfittingRegularizationCheck}
      failures={overfittingRegularizationFailures}
      breakIt={<RegularizationBreakIt />}
      checkCompanion={<RegularizationCheckLab />}
      hero={<RegularizationHero />}
      story={<RegularizationStory />}
      experiment={<RegularizationLab />}
      lede={
        <p>
          Regularization adds a cost for large or complex parameter values. It reduces a
          model&apos;s effective flexibility without necessarily changing its nominal
          architecture or polynomial degree.
        </p>
      }
      promise={
        <>
          You&apos;ll tune the regularization strength from under-penalized to well-balanced
          to over-penalized—and see how validation error reveals the useful middle.
        </>
      }
      experimentLede={
        <>
          Move λ across several orders of magnitude. Watch the coefficients shrink, the
          curve smooth, and training and validation error trade places, then connect the
          behavior to the ridge penalty.
        </>
      }
    />
  );
}
