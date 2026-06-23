import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { TrainTestBreakIt } from "@/components/exhibits/TrainTestBreakIt";
import { TrainTestCheckLab } from "@/components/exhibits/TrainTestCheckLab";
import { TrainTestLab } from "@/components/exhibits/TrainTestLab";
import { TrainTestStory } from "@/components/exhibits/TrainTestStory";
import { trainTestGeneralizationCheck } from "@content/exhibits/train-test-generalization/concept-check";
import { trainTestGeneralizationFailures } from "@content/exhibits/train-test-generalization/failures";
import { trainTestGeneralizationMath } from "@content/exhibits/train-test-generalization/math";
import { trainTestGeneralizationNarrative } from "@content/exhibits/train-test-generalization/narrative";
import { trainTestGeneralizationSpine } from "@content/exhibits/train-test-generalization/spine";

export default function TrainTestGeneralizationExhibit() {
  return (
    <ExhibitFrame
      nodeId="train-test-generalization"
      narrative={trainTestGeneralizationNarrative}
      spine={trainTestGeneralizationSpine}
      math={trainTestGeneralizationMath}
      check={trainTestGeneralizationCheck}
      failures={trainTestGeneralizationFailures}
      breakIt={<TrainTestBreakIt />}
      checkCompanion={<TrainTestCheckLab />}
      story={<TrainTestStory />}
      experiment={<TrainTestLab />}
      lede={
        <p>
          The most natural way to check a model — score it on its own training data — is
          the one that lies. Hold data out, and a new problem appears: which points you
          hold out is a coin toss. Here&apos;s why a single split can&apos;t be trusted,
          and what to do instead.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll watch the test error swing wildly as you
          reshuffle the split — and reach for cross-validation, the number that doesn&apos;t.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Reshuffle the train/test split and watch the test error scatter
          while the training error sits still, then read the cross-validation mark that
          barely budges — and the maths of why training error flatters underneath.
        </>
      }
    />
  );
}
