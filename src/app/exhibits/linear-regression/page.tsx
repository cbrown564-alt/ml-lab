import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { LinearRegressionHero } from "@/components/exhibits/LinearRegressionHero";
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
      hero={<LinearRegressionHero />}
      lede={
        <p>
          The straight line that started it all. Before the math, get your
          hands on it: every point below is data the line must answer to, and
          the line you see is always the best one available — for a very
          particular meaning of &ldquo;best.&rdquo;
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll see why a single stray point can
          wrench the whole line off true — and what that word &ldquo;best&rdquo;
          is really buying.
        </>
      }
      story={<LinearRegressionStory />}
      storyLayout="stepper"
      experiment={<LinearRegressionLab />}
    />
  );
}
