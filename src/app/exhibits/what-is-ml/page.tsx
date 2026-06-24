import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { WhatIsMlBreakIt } from "@/components/exhibits/WhatIsMlBreakIt";
import { WhatIsMlCheckLab } from "@/components/exhibits/WhatIsMlCheckLab";
import { WhatIsMlHero } from "@/components/exhibits/WhatIsMlHero";
import { WhatIsMlLab } from "@/components/exhibits/WhatIsMlLab";
import { WhatIsMlStory } from "@/components/exhibits/WhatIsMlStory";
import { whatIsMlCheck } from "@content/exhibits/what-is-ml/concept-check";
import { whatIsMlFailures } from "@content/exhibits/what-is-ml/failures";
import { whatIsMlMath } from "@content/exhibits/what-is-ml/math";
import { whatIsMlNarrative } from "@content/exhibits/what-is-ml/narrative";
import { whatIsMlSpine } from "@content/exhibits/what-is-ml/spine";

export default function WhatIsMlExhibit() {
  return (
    <ExhibitFrame
      nodeId="what-is-ml"
      narrative={whatIsMlNarrative}
      spine={whatIsMlSpine}
      math={whatIsMlMath}
      check={whatIsMlCheck}
      failures={whatIsMlFailures}
      breakIt={<WhatIsMlBreakIt />}
      checkCompanion={<WhatIsMlCheckLab />}
      hero={<WhatIsMlHero />}
      story={<WhatIsMlStory />}
      experiment={<WhatIsMlLab />}
      lede={
        <p>
          For seventy years, programming meant a human writing the rules. Machine learning
          is the inversion: you show examples, and the machine writes the rule — finding
          patterns you could never spell out by hand.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll have hand-written a rule, watched it top out,
          then watched a machine learn a better one from the same examples — and you&apos;ll
          hold the one definition the whole field rests on.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Be the programmer first: drag a threshold to hand-write a rule and
          see how far one feature gets you. Then press Learn and watch the machine fit a
          rule from the labelled examples that beats your best cut.
        </>
      }
    />
  );
}
