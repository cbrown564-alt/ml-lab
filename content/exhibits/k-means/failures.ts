import type { FailureGallery } from "@/lib/failure/schema";
import { badInitK2, goodK, wrongK } from "./experiment";

/**
 * k-means failure gallery. The three walls of the algorithm are all geometric:
 * give it too few centres, start those centres badly, or let a faraway point dominate
 * the squared-distance objective.
 */
export const kMeansFailures: FailureGallery = {
  nodeId: "k-means",
  intro:
    "k-means breaks exactly where its assumptions live: the number of groups, the centroid start, and the idea that squared Euclidean distance is the right notion of similarity.",
  cards: [
    {
      id: "wrong-k-merges-real-groups",
      primitive: "underfitting",
      title: "Too few centroids merge real clusters",
      trigger:
        "Force k = 2 on the committed three-blob dataset and rerun the clustering.",
      symptom: `Two natural blobs get merged under one centroid, and inertia stays huge (${wrongK.inertia.toFixed(
        2,
      )} instead of ${goodK.inertia.toFixed(2)} at k = 3).`,
      diagnosis:
        "The model is too rigid for the structure in the data. With only two centres available, k-means cannot represent three real groups no matter how long Lloyd's loop runs.",
      repair:
        "Raise k and compare candidate partitions with a domain-aware criterion (elbow, silhouette, or simply whether the grouping matches the task you care about).",
      boundary:
        "Bigger k is not automatically wiser: too many centroids just subdivide real clusters and keep lowering inertia even when the grouping stops making sense.",
    },
    {
      id: "bad-start-takes-a-crooked-path",
      primitive: "bad-initialisation",
      title: "Two seeds start in the same blob",
      trigger:
        "Initialise both k = 2 centroids inside one blob — the committed bad start does exactly that.",
      symptom: `The first assignment is lopsided and one centroid must travel a long way before the loop repairs itself; from this start the final inertia is still ${badInitK2.inertia.toFixed(
        2,
      )}, but the path there is ugly.`,
      diagnosis:
        "Lloyd's algorithm is only a local search. Where you drop the centroids changes which basin of attraction you start in, and on harder data a bad start can trap you in a genuinely worse local optimum.",
      repair:
        "Use multiple random restarts or a smarter seeding scheme such as k-means++, which spreads the initial centroids out before the averaging loop begins.",
      boundary:
        "On clean, well-separated blobs like this fixture, even a silly start often repairs itself quickly. The danger grows when clusters overlap, densities differ, or the data has awkward shapes.",
    },
    {
      id: "outlier-drags-a-centroid",
      primitive: "outliers",
      title: "One faraway point can hijack a centroid",
      trigger:
        "Add or emphasise a point far from every blob, then fit k-means with the same k.",
      symptom:
        "A centroid gets pulled toward the outlier or even devoted to it, leaving one real blob under-served because the squared-distance objective rewards chasing the huge miss.",
      diagnosis:
        "k-means minimises squared Euclidean distance, so a very distant point contributes disproportionately to inertia and can outvote many ordinary points near a dense cluster.",
      repair:
        "Standardise features, inspect extreme points, and if outliers are genuine structure use a method less hostage to means and squared distance (for example k-medoids or density-based clustering).",
      boundary:
        "Sometimes the outlier is the whole point — fraud, a rare fault mode, a VIP segment. Treating it as noise can erase the signal you most care about.",
    },
  ],
};
