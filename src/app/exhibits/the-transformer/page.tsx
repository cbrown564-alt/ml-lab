import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { TransformerBreakIt } from "@/components/exhibits/TransformerBreakIt";
import { TransformerCheckLab } from "@/components/exhibits/TransformerCheckLab";
import { TransformerHero } from "@/components/exhibits/TransformerHero";
import { TransformerLab } from "@/components/exhibits/TransformerLab";
import { TransformerStory } from "@/components/exhibits/TransformerStory";
import { transformerCheck } from "@content/exhibits/the-transformer/concept-check";
import { transformerFailures } from "@content/exhibits/the-transformer/failures";
import { transformerMath } from "@content/exhibits/the-transformer/math";
import { transformerNarrative } from "@content/exhibits/the-transformer/narrative";
import { transformerSpine } from "@content/exhibits/the-transformer/spine";

export default function TransformerExhibit() {
  return (
    <ExhibitFrame
      nodeId="the-transformer"
      narrative={transformerNarrative}
      spine={transformerSpine}
      math={transformerMath}
      check={transformerCheck}
      failures={transformerFailures}
      breakIt={<TransformerBreakIt />}
      checkCompanion={<TransformerCheckLab />}
      hero={<TransformerHero />}
      story={<TransformerStory />}
      experiment={<TransformerLab />}
      lede={
        <p>
          The transformer repeats one block — self-attention, residuals, feed-forward — then
          scores the next token. Stack depth composes representations; the language-model head
          turns the final hidden state into a vocabulary distribution.
        </p>
      }
      promise={
        <>
          You&apos;ll step through a block on &quot;The cat sat on the ___&quot;, watch mat lead
          the logits, stack a second block, and break training with residuals off or decode with
          temperature too high.
        </>
      }
      experimentLede={
        <>
          Three controls: stack depth, softmax temperature, and block stage. Read the flow
          diagram, then the next-token bars as the LM head output.
        </>
      }
    />
  );
}
