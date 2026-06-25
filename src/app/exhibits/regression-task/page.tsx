import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { RegressionTaskBreakIt } from "@/components/exhibits/RegressionTaskBreakIt";
import { RegressionTaskCheckLab } from "@/components/exhibits/RegressionTaskCheckLab";
import { RegressionTaskHero } from "@/components/exhibits/RegressionTaskHero";
import { RegressionTaskLab } from "@/components/exhibits/RegressionTaskLab";
import { RegressionTaskStory } from "@/components/exhibits/RegressionTaskStory";
import { regressionTaskCheck } from "@content/exhibits/regression-task/concept-check";
import { regressionTaskFailures } from "@content/exhibits/regression-task/failures";
import { regressionTaskMath } from "@content/exhibits/regression-task/math";
import { regressionTaskNarrative } from "@content/exhibits/regression-task/narrative";
import { regressionTaskSpine } from "@content/exhibits/regression-task/spine";

export default function RegressionTaskExhibit() {
  return (
    <ExhibitFrame
      nodeId="regression-task"
      narrative={regressionTaskNarrative}
      spine={regressionTaskSpine}
      math={regressionTaskMath}
      check={regressionTaskCheck}
      failures={regressionTaskFailures}
      breakIt={<RegressionTaskBreakIt />}
      checkCompanion={<RegressionTaskCheckLab />}
      hero={<RegressionTaskHero />}
      story={<RegressionTaskStory />}
      experiment={<RegressionTaskLab />}
      lede={
        <p>
          A regression task predicts a quantity on a numeric scale: price, demand,
          temperature, or time. Because near and far misses are different, you evaluate the
          size of the errors—not just whether a prediction crossed an arbitrary cutoff.
        </p>
      }
      promise={
        <>
          You&apos;ll be able to recognize a regression task from its target, choose a
          distance-based metric, and explain what is lost when a continuous outcome is forced
          into yes/no labels.
        </>
      }
      experimentLede={
        <>
          Predict each score yourself, reveal the observed value, and watch the errors
          accumulate. Then change the scoring rule to see why the metric must match the
          decision.
        </>
      }
    />
  );
}
