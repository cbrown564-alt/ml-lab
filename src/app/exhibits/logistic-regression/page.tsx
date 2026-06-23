import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { LogisticRegressionLab } from "@/components/exhibits/LogisticRegressionLab";
import { LogisticRegressionStory } from "@/components/exhibits/LogisticRegressionStory";
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
      story={<LogisticRegressionStory />}
      experiment={<LogisticRegressionLab />}
      lede={
        <p>
          When the answer isn&apos;t a number but a which-one, you reach for
          classification. Logistic regression is its workhorse — and linear
          regression&apos;s closest cousin: the same linear score, bent through one
          function into a probability, split by one line.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll watch gradient descent swing a line into
          the gap between two classes — and read off not just a verdict but how sure the
          model is, everywhere.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Press Train and scrub the descent, toggle the probability
          field, and watch the boundary settle into the overlap the data won&apos;t let
          it cross — then read the same model as the maths underneath.
        </>
      }
    />
  );
}
