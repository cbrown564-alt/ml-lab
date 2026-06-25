import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { LogisticRegressionBreakIt } from "@/components/exhibits/LogisticRegressionBreakIt";
import { LogisticRegressionCheckLab } from "@/components/exhibits/LogisticRegressionCheckLab";
import { LogisticRegressionLab } from "@/components/exhibits/LogisticRegressionLab";
import { LogisticRegressionHero } from "@/components/exhibits/LogisticRegressionHero";
import { LogisticRegressionStory } from "@/components/exhibits/LogisticRegressionStory";
import { logisticRegressionCheck } from "@content/exhibits/logistic-regression/concept-check";
import { logisticRegressionFailures } from "@content/exhibits/logistic-regression/failures";
import { logisticRegressionMath } from "@content/exhibits/logistic-regression/math";
import { logisticRegressionNarrative } from "@content/exhibits/logistic-regression/narrative";
import { logisticRegressionSpine } from "@content/exhibits/logistic-regression/spine";

export default function LogisticRegressionExhibit() {
  return (
    <ExhibitFrame
      nodeId="logistic-regression"
      narrative={logisticRegressionNarrative}
      spine={logisticRegressionSpine}
      math={logisticRegressionMath}
      check={logisticRegressionCheck}
      failures={logisticRegressionFailures}
      breakIt={<LogisticRegressionBreakIt />}
      checkCompanion={<LogisticRegressionCheckLab />}
      hero={<LogisticRegressionHero />}
      story={<LogisticRegressionStory />}
      experiment={<LogisticRegressionLab />}
      lede={
        <p>
          Logistic regression turns a linear score into an estimated probability for a binary
          outcome. The score stays linear in the features; the sigmoid maps it into 0–1,
          and a threshold turns it into a decision.
        </p>
      }
      promise={
        <>
          You&apos;ll trace the path from linear score to probability to boundary—and see
          exactly why a straight boundary fails on a curved problem.
        </>
      }
      experimentLede={
        <>
          Train the model and scrub through the updates. Toggle the probability field, then
          add a nonlinear feature to compare a straight boundary with a curved one.
        </>
      }
    />
  );
}
