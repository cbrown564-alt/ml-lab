import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { PcaBreakIt } from "@/components/exhibits/PcaBreakIt";
import { PcaCheckLab } from "@/components/exhibits/PcaCheckLab";
import { PcaHero } from "@/components/exhibits/PcaHero";
import { PcaLab } from "@/components/exhibits/PcaLab";
import { PcaStory } from "@/components/exhibits/PcaStory";
import { pcaCheck } from "@content/exhibits/pca/concept-check";
import { pcaFailures } from "@content/exhibits/pca/failures";
import { pcaMath } from "@content/exhibits/pca/math";
import { pcaNarrative } from "@content/exhibits/pca/narrative";
import { pcaSpine } from "@content/exhibits/pca/spine";

export default function PcaExhibit() {
  return (
    <ExhibitFrame
      nodeId="pca"
      narrative={pcaNarrative}
      spine={pcaSpine}
      math={pcaMath}
      check={pcaCheck}
      failures={pcaFailures}
      breakIt={<PcaBreakIt />}
      checkCompanion={<PcaCheckLab />}
      hero={<PcaHero />}
      story={<PcaStory />}
      experiment={<PcaLab />}
      lede={
        <p>
          Principal component analysis rotates a correlated cloud into new axes ordered by
          variance. The first axis captures the longest spread; later axes hold the thinner
          leftovers. Keep the first few and you compress the data while preserving most of
          its shape.
        </p>
      }
      promise={
        <>
          You&apos;ll watch one tilted cloud collapse to a single number per point — and see
          exactly what tiny sliver of variation is lost when you throw the second axis away.
        </>
      }
      experimentLede={
        <>
          One toggle: how many principal components to keep. Flip between a 1-D
          reconstruction and the full 2-D one, then compare the explained-variance bars to
          the reconstruction loss they buy you.
        </>
      }
    />
  );
}
