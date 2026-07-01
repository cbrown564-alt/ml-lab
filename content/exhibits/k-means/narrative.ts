import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * k-means as the first unsupervised move in the map: no targets, no "right answer"
 * supplied, only geometry. The learner sees the whole algorithm as a loop of two tiny
 * moves — assign to the nearest centroid, then average — and then sees the catch:
 * k must be chosen in advance, and the objective only knows Euclidean distance.
 */
export const kMeansNarrative: ExhibitNarrative = {
  nodeId: "k-means",
  hook: [
    "Take the labels away. All you have now is a cloud of points, and a hunch that some of them belong together. That is the unsupervised setting: no target column, no teacher telling you what the classes are, only structure in the data itself. k-means is the blunt, famous way to ask for that structure.",
    "You pick how many groups you want — k — drop that many centres into the plane, and let each point join the nearest one. Then each centre moves to the average of the points that claimed it. Repeat those two moves and the centroids settle into the blobs. No labels, no probabilities, just geometry.",
  ],
  story: [
    {
      id: "assign-nearest",
      heading: "Assign to the nearest centroid",
      paragraphs: [
        "Start with three centres. Every point measures its distance to each one and joins the nearest centroid. That instantly divides the plane into nearest-centroid regions: every patch of space belongs to whichever centre is closest. The clusters are not discovered by category names or target labels — just distance.",
        "This first step is already the whole visual idea of k-means: each centroid radiates outward and claims the points around it. If the centroids begin in sensible places, the assignments already resemble the blobs. If they begin badly, the loop can take a crooked path or settle into the wrong partition.",
      ],
    },
    {
      id: "average-centroids",
      heading: "Move each centroid to the mean",
      paragraphs: [
        "Once a centroid knows which points belong to it, it moves to the average of those points. That is why the method is called k-means: each centre is literally the mean of its assigned cluster. On this clean dataset, one update is enough for the centroids to land right in the middle of the three blobs.",
        "Then the loop repeats. Reassign every point to the nearest updated centroid, average again, and keep going until nothing changes. Lloyd's algorithm sounds grand, but it is only these two tiny moves alternating until the picture settles.",
      ],
    },
    {
      id: "wrong-k",
      heading: "Force the wrong number of clusters",
      paragraphs: [
        "Now break the hidden assumption. The data has three clear blobs, but tell the algorithm it may use only two centres. It has no choice but to force three blobs into two groups: one centroid keeps the far-left blob, and the other centroid is pulled into serving the two right-hand blobs together.",
        "Nothing in the objective says 'respect the natural groups.' It only says 'make points close to their assigned centroid.' With the wrong k, the algorithm obediently solves the wrong problem. The result is not a bug; it is the honest consequence of the question you asked.",
      ],
    },
    {
      id: "repeat-until-stable",
      heading: "Repeat until nothing changes",
      paragraphs: [
        "On well-separated blobs the loop settles fast. But 'fast' and 'correct' are not the same thing: if you ask for too many groups, the extra centroids simply subdivide real clusters, because the objective only knows distance. It is happy to shave a little more squared distance even when no human would call the split meaningful.",
        "That is the whole personality of k-means. Elegant, cheap, and easy to picture — but committed to spherical, distance-based groupings and to a k you chose in advance. The algorithm does exactly what its objective asks and nothing more.",
      ],
    },
  ],
  fieldNotes: [
    "k-means is extremely sensitive to feature scale because distance is the whole game. If one feature is measured in dollars and another in visits-per-week, the large-scale feature will dominate unless you standardize first — exactly the feature-scaling lesson, now in unsupervised form.",
    "The method works best when clusters are roughly compact and blob-like. Long crescents, unequal densities, and outliers are not edge cases for k-means; they are mismatches to its geometry. When the shape assumption is wrong, a different clustering method is the right repair, not more Lloyd steps.",
  ],
};
