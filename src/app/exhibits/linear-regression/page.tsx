import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { LinearRegressionBreakIt } from "@/components/exhibits/LinearRegressionBreakIt";
import { LinearRegressionCheckLab } from "@/components/exhibits/LinearRegressionCheckLab";
import { LinearRegressionHero } from "@/components/exhibits/LinearRegressionHero";
import { LinearRegressionLab } from "@/components/exhibits/LinearRegressionLab";
import { LinearRegressionStory } from "@/components/exhibits/LinearRegressionStory";
import { linearRegressionCheck } from "@content/exhibits/linear-regression/concept-check";
import { linearRegressionFailures } from "@content/exhibits/linear-regression/failures";
import { linearRegressionMath } from "@content/exhibits/linear-regression/math";
import { linearRegressionNarrative } from "@content/exhibits/linear-regression/narrative";
import { linearRegressionSpine } from "@content/exhibits/linear-regression/spine";

export default function LinearRegressionExhibit() {
  return (
    <ExhibitFrame
      nodeId="linear-regression"
      check={linearRegressionCheck}
      narrative={linearRegressionNarrative}
      spine={linearRegressionSpine}
      math={linearRegressionMath}
      failures={linearRegressionFailures}
      breakIt={<LinearRegressionBreakIt />}
      checkCompanion={<LinearRegressionCheckLab />}
      hero={<LinearRegressionHero />}
      lede={
        <p>
          Linear regression fits a straight-line relationship between inputs and a numeric
          target. Here, &ldquo;best&rdquo; means the line that minimizes the sum of squared
          vertical residuals.
        </p>
      }
      promise={
        <>
          You&apos;ll see how residuals determine the fit, why squaring makes large misses
          influential, and when a robust loss may be a better choice.
        </>
      }
      story={<LinearRegressionStory />}
      experiment={<LinearRegressionLab />}
      experimentLede={
        <>
          Drag or add points and watch the least-squares line refit instantly. Switch to
          code to run the same calculation, then compare the result with the visual.
        </>
      }
    />
  );
}
