import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { DataLeakageBreakIt } from "@/components/exhibits/DataLeakageBreakIt";
import { DataLeakageCheckLab } from "@/components/exhibits/DataLeakageCheckLab";
import { DataLeakageHero } from "@/components/exhibits/DataLeakageHero";
import { DataLeakageLabLazy } from "@/components/exhibits/DataLeakageLabLazy";
import { DataLeakageStory } from "@/components/exhibits/DataLeakageStory";
import { dataLeakageCheck } from "@content/exhibits/data-leakage/concept-check";
import { dataLeakageFailures } from "@content/exhibits/data-leakage/failures";
import { dataLeakageMath } from "@content/exhibits/data-leakage/math";
import { dataLeakageNarrative } from "@content/exhibits/data-leakage/narrative";
import { dataLeakageSpine } from "@content/exhibits/data-leakage/spine";

export default function DataLeakageExhibit() {
  return (
    <ExhibitFrame
      nodeId="data-leakage"
      narrative={dataLeakageNarrative}
      spine={dataLeakageSpine}
      math={dataLeakageMath}
      check={dataLeakageCheck}
      failures={dataLeakageFailures}
      breakIt={<DataLeakageBreakIt />}
      checkCompanion={<DataLeakageCheckLab />}
      hero={<DataLeakageHero />}
      story={<DataLeakageStory />}
      experiment={<DataLeakageLabLazy />}
      lede={
        <p>
          Data leakage happens when information unavailable at prediction time influences
          training or evaluation. The result is an optimistic score that can collapse on
          truly unseen data.
        </p>
      }
      promise={
        <>
          You&apos;ll manufacture a strong score from pure noise, locate the leak in the
          pipeline, and rebuild the evaluation so every fold is genuinely held out.
        </>
      }
      experimentLede={
        <>
          Compare feature selection performed before cross-validation with selection fitted
          inside each fold. Watch the apparent R² vanish when the pipeline stops peeking.
        </>
      }
    />
  );
}
