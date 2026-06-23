import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { ClassificationTaskLab } from "@/components/exhibits/ClassificationTaskLab";
import { ClassificationTaskStory } from "@/components/exhibits/ClassificationTaskStory";
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
      story={<ClassificationTaskStory />}
      experiment={<ClassificationTaskLab />}
      lede={
        <p>
          A classifier gives you a probability; turning it into a decision is a separate
          task — and where you draw the line trades catching every positive against
          crying wolf. Accuracy alone hides that trade; the confusion matrix shows it.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll drag one threshold and watch precision and
          recall pull apart — and know why the right line depends on what a mistake costs,
          not on the model.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Drag the decision threshold across the probability strip, watch
          the confusion matrix re-count and precision, recall, accuracy, and F1 move — then
          the metrics as the maths underneath.
        </>
      }
    />
  );
}
