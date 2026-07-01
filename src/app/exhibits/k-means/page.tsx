import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { KMeansBreakIt } from "@/components/exhibits/KMeansBreakIt";
import { KMeansCheckLab } from "@/components/exhibits/KMeansCheckLab";
import { KMeansHero } from "@/components/exhibits/KMeansHero";
import { KMeansLab } from "@/components/exhibits/KMeansLab";
import { KMeansStory } from "@/components/exhibits/KMeansStory";
import { kMeansCheck } from "@content/exhibits/k-means/concept-check";
import { kMeansFailures } from "@content/exhibits/k-means/failures";
import { kMeansMath } from "@content/exhibits/k-means/math";
import { kMeansNarrative } from "@content/exhibits/k-means/narrative";
import { kMeansSpine } from "@content/exhibits/k-means/spine";

export default function KMeansExhibit() {
  return (
    <ExhibitFrame
      nodeId="k-means"
      narrative={kMeansNarrative}
      spine={kMeansSpine}
      math={kMeansMath}
      check={kMeansCheck}
      failures={kMeansFailures}
      breakIt={<KMeansBreakIt />}
      checkCompanion={<KMeansCheckLab />}
      hero={<KMeansHero />}
      story={<KMeansStory />}
      experiment={<KMeansLab />}
      lede={
        <p>
          k-means is the classic unsupervised clustering move: choose how many groups you
          want, place that many centroids, and let geometry do the rest. Every point joins
          its nearest centroid; every centroid moves to the mean of the points it owns.
        </p>
      }
      promise={
        <>
          You&apos;ll watch three unlabeled blobs resolve into clusters by pure distance —
          and then watch the same algorithm fail honestly when you ask the wrong question,
          giving it too few centres or a bad start.
        </>
      }
      experimentLede={
        <>
          Two controls: choose <em>k</em>, then step the Lloyd loop. Watch the nearest-centroid
          regions redraw, the centroids jump to their means, and the inertia tell you how
          tightly the current partition packs the points.
        </>
      }
    />
  );
}
