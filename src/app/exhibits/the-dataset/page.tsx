import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { TheDatasetBreakIt } from "@/components/exhibits/TheDatasetBreakIt";
import { TheDatasetCheckLab } from "@/components/exhibits/TheDatasetCheckLab";
import { TheDatasetLab } from "@/components/exhibits/TheDatasetLab";
import { TheDatasetStory } from "@/components/exhibits/TheDatasetStory";
import { theDatasetCheck } from "@content/exhibits/the-dataset/concept-check";
import { theDatasetFailures } from "@content/exhibits/the-dataset/failures";
import { theDatasetMath } from "@content/exhibits/the-dataset/math";
import { theDatasetNarrative } from "@content/exhibits/the-dataset/narrative";
import { theDatasetSpine } from "@content/exhibits/the-dataset/spine";

export default function TheDatasetExhibit() {
  return (
    <ExhibitFrame
      nodeId="the-dataset"
      narrative={theDatasetNarrative}
      spine={theDatasetSpine}
      math={theDatasetMath}
      check={theDatasetCheck}
      failures={theDatasetFailures}
      breakIt={<TheDatasetBreakIt />}
      checkCompanion={<TheDatasetCheckLab />}
      story={<TheDatasetStory />}
      experiment={<TheDatasetLab />}
      lede={
        <p>
          Before the algorithm, before the maths, there is the table. A dataset is rows of
          experience — features and a target — and it is the entire world the model gets to
          learn from. Read it the way a model does.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and a dataset will stop being a spreadsheet and become what it
          is to a model: a matrix of examples whose every row, column, and typo shapes what
          gets learned.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Hover a row to find its point, or a point to find its row — the
          table and the scatter are one matrix. See the features, the target, and how each
          example sits in the data.
        </>
      }
    />
  );
}
