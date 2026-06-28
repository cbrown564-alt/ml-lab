import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { RandomForestBreakIt } from "@/components/exhibits/RandomForestBreakIt";
import { RandomForestCheckLab } from "@/components/exhibits/RandomForestCheckLab";
import { RandomForestHero } from "@/components/exhibits/RandomForestHero";
import { RandomForestLab } from "@/components/exhibits/RandomForestLab";
import { RandomForestStory } from "@/components/exhibits/RandomForestStory";
import { randomForestsCheck } from "@content/exhibits/random-forests/concept-check";
import { randomForestsFailures } from "@content/exhibits/random-forests/failures";
import { randomForestsMath } from "@content/exhibits/random-forests/math";
import { randomForestsNarrative } from "@content/exhibits/random-forests/narrative";
import { randomForestsSpine } from "@content/exhibits/random-forests/spine";

export default function RandomForestsExhibit() {
  return (
    <ExhibitFrame
      nodeId="random-forests"
      narrative={randomForestsNarrative}
      spine={randomForestsSpine}
      math={randomForestsMath}
      check={randomForestsCheck}
      failures={randomForestsFailures}
      breakIt={<RandomForestBreakIt />}
      checkCompanion={<RandomForestCheckLab />}
      hero={<RandomForestHero />}
      story={<RandomForestStory />}
      experiment={<RandomForestLab />}
      lede={
        <p>
          A random forest grows hundreds of decision trees — each on its own random resample
          of the data, each free to ask different questions — and averages their votes. Any
          one tree overfits; their disagreement cancels in the average, leaving a boundary
          far smoother and steadier than any single tree.
        </p>
      }
      promise={
        <>
          You&apos;ll watch a crowd of jagged, overfit trees average into one clean
          boundary — and discover why adding more trees, unlike adding depth, can never
          overfit.
        </>
      }
      experimentLede={
        <>
          One knob: the number of trees. Drag it and watch the single tree&apos;s staircase
          blur into a smooth vote while the held-out score climbs and then flattens — never
          the U a single tree&apos;s depth made.
        </>
      }
    />
  );
}
