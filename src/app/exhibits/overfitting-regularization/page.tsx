import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { OverfittingAudioLabLazy } from "@/components/exhibits/OverfittingAudioLabLazy";
import { RegularizationBreakIt } from "@/components/exhibits/RegularizationBreakIt";
import { RegularizationCheckLab } from "@/components/exhibits/RegularizationCheckLab";
import { RegularizationLab } from "@/components/exhibits/RegularizationLab";
import { RegularizationHero } from "@/components/exhibits/RegularizationHero";
import { RegularizationStory } from "@/components/exhibits/RegularizationStory";
import { GeneratedMediaNote } from "@/components/exhibits/GeneratedMediaNote";
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
      supportingMedia={
        <GeneratedMediaNote
          kind="video"
          src="/media/generated/overfitting-regularization/noise-signal.mp4"
          poster="/media/generated/overfitting-regularization/noise-signal-poster.png"
          duration="6 seconds"
          title="Signal under interference"
          description="Violet fragments make a blue signal harder to read. Noise is a recurring cue here, not a literal dataset or an explanation of regularization."
        />
      }
      experiment={
        <div className="flex flex-col gap-14">
          <OverfittingAudioLabLazy key="hear-the-gap" />
          <div key="regularization-repair">
            <h3 className="mb-4 text-2xl font-semibold">Now repair it with regularization</h3>
            <RegularizationLab />
          </div>
        </div>
      }
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
          First locate the moment training and held-out performance part company—by sight,
          and optionally by sound. Then move λ across several orders of magnitude to rein
          the same failure back in.
        </>
      }
    />
  );
}
