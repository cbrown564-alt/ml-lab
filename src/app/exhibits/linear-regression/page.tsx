import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { LinearRegressionLab } from "@/components/exhibits/LinearRegressionLab";
import { linearRegressionCheck } from "@content/exhibits/linear-regression/concept-check";
import { linearRegressionNarrative } from "@content/exhibits/linear-regression/narrative";

export default function LinearRegressionExhibit() {
  return (
    <ExhibitFrame
      nodeId="linear-regression"
      check={linearRegressionCheck}
      narrative={linearRegressionNarrative}
      lede={
        <p>
          The straight line that started it all. Before the math, get your
          hands on it: every point below is data the line must answer to, and
          the line you see is always the best one available — for a very
          particular meaning of &ldquo;best.&rdquo;
        </p>
      }
    >
      <LinearRegressionLab />
    </ExhibitFrame>
  );
}
