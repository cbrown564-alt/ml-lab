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
          Before a single line is fit, one decision shapes everything: what are you
          predicting? A regression task answers with a continuous number — and asks to be
          judged not on right-or-wrong, but on how close.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll have <em>been</em> the model — predicting
          continuous values by hand, feeling the loss as distance — and you&apos;ll tell a
          regression task from a classification one on sight, by its target.
        </>
      }
      experimentLede={
        <>
          Guardrails off. You&apos;re the model: for each student you see only the hours —
          drag your predicted score, reveal the truth, and watch the error stack up as
          distance. The total is the loss a real model would minimise.
        </>
      }
    />
  );
}
