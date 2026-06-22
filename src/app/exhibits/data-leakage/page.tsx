import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { DataLeakageLab } from "@/components/exhibits/DataLeakageLab";
import { DataLeakageStory } from "@/components/exhibits/DataLeakageStory";
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
      story={<DataLeakageStory />}
      experiment={<DataLeakageLab />}
      lede={
        <p>
          The most dangerous number in machine learning is a validation score that
          looks great and is a lie. Here&apos;s one manufactured from pure noise — and
          the one discipline that makes it vanish.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll watch a model &ldquo;explain&rdquo; half
          the variance of random noise — and learn to spot, and close, the side channel
          that let it.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Flip between selecting features on all the data and selecting
          inside each fold, and watch the cross-validation R² — and the predicted-vs-actual
          scatter — swing between confident skill and the honest nothing.
        </>
      }
    />
  );
}
