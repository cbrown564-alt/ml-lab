import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { CnnsBreakIt } from "@/components/exhibits/CnnsBreakIt";
import { CnnsCheckLab } from "@/components/exhibits/CnnsCheckLab";
import { CnnsHero } from "@/components/exhibits/CnnsHero";
import { CnnsLab } from "@/components/exhibits/CnnsLab";
import { CnnsStory } from "@/components/exhibits/CnnsStory";
import { cnnsCheck } from "@content/exhibits/cnns/concept-check";
import { cnnsFailures } from "@content/exhibits/cnns/failures";
import { cnnsMath } from "@content/exhibits/cnns/math";
import { cnnsNarrative } from "@content/exhibits/cnns/narrative";
import { cnnsSpine } from "@content/exhibits/cnns/spine";

export default function CnnsExhibit() {
  return (
    <ExhibitFrame
      nodeId="cnns"
      narrative={cnnsNarrative}
      spine={cnnsSpine}
      math={cnnsMath}
      check={cnnsCheck}
      failures={cnnsFailures}
      breakIt={<CnnsBreakIt />}
      checkCompanion={<CnnsCheckLab />}
      hero={<CnnsHero />}
      story={<CnnsStory />}
      experiment={<CnnsLab />}
      lede={
        <p>
          Convolutional networks treat images as grids, not flattened vectors. A small filter
          slides across the input, dot-producting local patches into a feature map — the same
          kernel everywhere, not a separate weight per pixel pairing.
        </p>
      }
      promise={
        <>
          You&apos;ll slide a 3×3 filter across tiny grids, watch weight sharing cut parameters
          from thousands to ten, and break the dense-layer assumption by shifting an image one
          pixel.
        </>
      }
      experimentLede={
        <>
          Three controls: pick an image, pick a filter, scrub the slide position. Read each output
          as a dot product and compare the parameter count to what flattening would cost.
        </>
      }
    />
  );
}
