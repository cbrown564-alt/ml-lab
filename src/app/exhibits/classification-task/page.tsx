import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { ClassificationTaskBreakIt } from "@/components/exhibits/ClassificationTaskBreakIt";
import { ClassificationTaskCheckLab } from "@/components/exhibits/ClassificationTaskCheckLab";
import { ClassificationTaskLab } from "@/components/exhibits/ClassificationTaskLab";
import { ClassificationTaskHero } from "@/components/exhibits/ClassificationTaskHero";
import { ClassificationTaskStory } from "@/components/exhibits/ClassificationTaskStory";
import { classificationTaskCheck } from "@content/exhibits/classification-task/concept-check";
import { classificationTaskFailures } from "@content/exhibits/classification-task/failures";
import { classificationTaskMath } from "@content/exhibits/classification-task/math";
import { classificationTaskNarrative } from "@content/exhibits/classification-task/narrative";
import { classificationTaskSpine } from "@content/exhibits/classification-task/spine";

export default function ClassificationTaskExhibit() {
  return (
    <ExhibitFrame
      nodeId="classification-task"
      narrative={classificationTaskNarrative}
      spine={classificationTaskSpine}
      math={classificationTaskMath}
      check={classificationTaskCheck}
      failures={classificationTaskFailures}
      breakIt={<ClassificationTaskBreakIt />}
      checkCompanion={<ClassificationTaskCheckLab />}
      hero={<ClassificationTaskHero />}
      story={<ClassificationTaskStory />}
      experiment={<ClassificationTaskLab />}
      lede={
        <p>
          A classifier often produces a score or estimated probability. Turning that score
          into an action requires a threshold—and moving it changes the balance between
          false alarms and missed positives.
        </p>
      }
      promise={
        <>
          You&apos;ll read a confusion matrix, distinguish precision from recall, and choose
          a threshold from the cost of each error—not from a default.
        </>
      }
      experimentLede={
        <>
          Drag the threshold across the score distribution. Watch the confusion matrix and
          metrics update, then connect each number to the counts it summarizes.
        </>
      }
    />
  );
}
