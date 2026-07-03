import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { EmbeddingsBreakIt } from "@/components/exhibits/EmbeddingsBreakIt";
import { EmbeddingsCheckLab } from "@/components/exhibits/EmbeddingsCheckLab";
import { EmbeddingsHero } from "@/components/exhibits/EmbeddingsHero";
import { EmbeddingsLab } from "@/components/exhibits/EmbeddingsLab";
import { EmbeddingsStory } from "@/components/exhibits/EmbeddingsStory";
import { embeddingsCheck } from "@content/exhibits/embeddings/concept-check";
import { embeddingsFailures } from "@content/exhibits/embeddings/failures";
import { embeddingsMath } from "@content/exhibits/embeddings/math";
import { embeddingsNarrative } from "@content/exhibits/embeddings/narrative";
import { embeddingsSpine } from "@content/exhibits/embeddings/spine";

export default function EmbeddingsExhibit() {
  return (
    <ExhibitFrame
      nodeId="embeddings"
      narrative={embeddingsNarrative}
      spine={embeddingsSpine}
      math={embeddingsMath}
      check={embeddingsCheck}
      failures={embeddingsFailures}
      breakIt={<EmbeddingsBreakIt />}
      checkCompanion={<EmbeddingsCheckLab />}
      hero={<EmbeddingsHero />}
      story={<EmbeddingsStory />}
      experiment={<EmbeddingsLab />}
      lede={
        <p>
          Embeddings map discrete tokens into a continuous vector space where distance and
          direction carry meaning — the coordinate system attention and transformers read and
          write.
        </p>
      }
      promise={
        <>
          You&apos;ll pick anchor words and watch cosine neighbours, run king − man + woman toward
          queen, and contrast learned coordinates with a PCA projection that chases variance instead
          of task geometry.
        </>
      }
      experimentLede={
        <>
          Two controls: choose an anchor token and toggle Learned versus PCA layout. Read the
          neighbour list as cosine scores — then ask whether the axes were chosen for prediction or
          for spread.
        </>
      }
    />
  );
}
