import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { AttentionBreakIt } from "@/components/exhibits/AttentionBreakIt";
import { AttentionCheckLab } from "@/components/exhibits/AttentionCheckLab";
import { AttentionHero } from "@/components/exhibits/AttentionHero";
import { AttentionLab } from "@/components/exhibits/AttentionLab";
import { AttentionStory } from "@/components/exhibits/AttentionStory";
import { attentionCheck } from "@content/exhibits/attention/concept-check";
import { attentionFailures } from "@content/exhibits/attention/failures";
import { attentionMath } from "@content/exhibits/attention/math";
import { attentionNarrative } from "@content/exhibits/attention/narrative";
import { attentionSpine } from "@content/exhibits/attention/spine";

export default function AttentionExhibit() {
  return (
    <ExhibitFrame
      nodeId="attention"
      narrative={attentionNarrative}
      spine={attentionSpine}
      math={attentionMath}
      check={attentionCheck}
      failures={attentionFailures}
      breakIt={<AttentionBreakIt />}
      checkCompanion={<AttentionCheckLab />}
      hero={<AttentionHero />}
      story={<AttentionStory />}
      experiment={<AttentionLab />}
      lede={
        <p>
          Attention lets every token ask who to read from the sequence. Queries score keys,
          softmax turns the scores into weights, and values blend into a contextual update —
          routing that changes with content, not a fixed window.
        </p>
      }
      promise={
        <>
          You&apos;ll scrub query rows and heads on a six-token sentence, watch sat route to cat
          and on route to mat, then break routing with uniform or frozen patterns.
        </>
      }
      experimentLede={
        <>
          Two controls: pick the query token and toggle Syntax versus Local head. Read the heatmap
          row as softmax weights, then the value mix bar as the weighted payload.
        </>
      }
    />
  );
}
