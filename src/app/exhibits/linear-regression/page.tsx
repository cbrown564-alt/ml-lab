import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { LinearRegressionLab } from "@/components/exhibits/LinearRegressionLab";
import { LinearRegressionStory } from "@/components/exhibits/LinearRegressionStory";
import { linearRegressionCheck } from "@content/exhibits/linear-regression/concept-check";
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
      lede={
        <p>
          The straight line that started it all. Before the math, get your
          hands on it: every point below is data the line must answer to, and
          the line you see is always the best one available — for a very
          particular meaning of &ldquo;best.&rdquo;
        </p>
      }
      story={<LinearRegressionStory />}
      experiment={<LinearRegressionLab />}
    />
  );
}
