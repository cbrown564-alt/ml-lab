import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { AdaptationBreakIt } from "@/components/exhibits/AdaptationBreakIt";
import { AdaptationCheckLab } from "@/components/exhibits/AdaptationCheckLab";
import { AdaptationHero } from "@/components/exhibits/AdaptationHero";
import { AdaptationLab } from "@/components/exhibits/AdaptationLab";
import { AdaptationStory } from "@/components/exhibits/AdaptationStory";
import { adaptationCheck } from "@content/exhibits/fine-tuning-vs-prompting-vs-rag/concept-check";
import { adaptationFailures } from "@content/exhibits/fine-tuning-vs-prompting-vs-rag/failures";
import { adaptationMath } from "@content/exhibits/fine-tuning-vs-prompting-vs-rag/math";
import { adaptationNarrative } from "@content/exhibits/fine-tuning-vs-prompting-vs-rag/narrative";
import { adaptationSpine } from "@content/exhibits/fine-tuning-vs-prompting-vs-rag/spine";

export default function AdaptationExhibit() {
  return (
    <ExhibitFrame
      nodeId="fine-tuning-vs-prompting-vs-rag"
      narrative={adaptationNarrative}
      spine={adaptationSpine}
      math={adaptationMath}
      check={adaptationCheck}
      failures={adaptationFailures}
      breakIt={<AdaptationBreakIt />}
      checkCompanion={<AdaptationCheckLab />}
      hero={<AdaptationHero />}
      story={<AdaptationStory />}
      experiment={<AdaptationLab />}
      lede={
        <p>
          A pretrained model is only the starting point. Fine-tuning updates weights, prompting
          updates instructions, and retrieval-augmented generation updates the evidence available at
          query time — three levers with different cost, freshness, and failure modes.
        </p>
      }
      promise={
        <>
          You&apos;ll compare all three on OrbitDesk support tickets, pick the lever for weekly doc
          changes, and break stale fine-tunes plus bad retrieval.
        </>
      }
      experimentLede={
        <>
          Two controls: choose the ticket and the strategy. Read the pipeline, sample answer, and
          comparison table — domain fit versus freshness, with citation when RAG is active.
        </>
      }
    />
  );
}
