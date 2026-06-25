import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { TrainTestBreakIt } from "@/components/exhibits/TrainTestBreakIt";
import { TrainTestCheckLab } from "@/components/exhibits/TrainTestCheckLab";
import { TrainTestHero } from "@/components/exhibits/TrainTestHero";
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
      hero={<TrainTestHero />}
      story={<TrainTestStory />}
      experiment={<TrainTestLab />}
      lede={
        <p>
          A training score tells you how well a model fits data it has seen. To estimate
          performance on new data, you need held-out evaluation—and a clear separation
          between data used to tune the model and data used only for the final check.
        </p>
      }
      promise={
        <>
          You&apos;ll see why one small split can be noisy, how cross-validation supports
          model selection, and why a final test set must stay untouched until the end.
        </>
      }
      experimentLede={
        <>
          Reshuffle the split and compare the variation in one holdout score with the
          distribution of cross-validation scores. Use validation or cross-validation to
          choose; reserve the test set for the final estimate.
        </>
      }
    />
  );
}
