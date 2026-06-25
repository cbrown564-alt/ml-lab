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
          In conventional programming, you write the rules. In supervised machine learning,
          you provide examples with answers, choose a model and objective, and an algorithm
          fits a rule that can predict new cases.
        </p>
      }
      promise={
        <>
          You&apos;ll be able to explain what the data supplies, what the learner chooses,
          and why a model can only be as reliable as the examples and objective behind it.
        </>
      }
      experimentLede={
        <>
          Write a one-feature rule by hand, then train a model on the same labeled examples.
          Compare what each rule can represent—and how biased examples bend the learned
          boundary.
        </>
      }
    />
  );
}
