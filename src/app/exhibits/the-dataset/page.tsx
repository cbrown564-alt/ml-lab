import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { TheDatasetBreakIt } from "@/components/exhibits/TheDatasetBreakIt";
import { TheDatasetCheckLab } from "@/components/exhibits/TheDatasetCheckLab";
import { TheDatasetHero } from "@/components/exhibits/TheDatasetHero";
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
      hero={<TheDatasetHero />}
      story={<TheDatasetStory />}
      experiment={<TheDatasetLab />}
      lede={
        <p>
          Every supervised model starts with a table: rows are examples, feature columns are
          the inputs, and the target is the answer to predict. The model can use only what
          the table represents, so omissions, errors, and sampling choices become part of
          the model.
        </p>
      }
      promise={
        <>
          You&apos;ll learn to read a dataset as a model does—and to spot how one missing
          variable, bad row, or unrepresentative sample can distort what it learns.
        </>
      }
      experimentLede={
        <>
          Move between the table and scatterplot: each row and point is the same example.
          Inspect the features and target, then introduce a bad row and watch the fitted
          trend change.
        </>
      }
    />
  );
}
