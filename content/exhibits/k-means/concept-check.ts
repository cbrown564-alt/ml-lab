import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * k-means concept check. The main misconceptions: that the clusters come from labels the
 * algorithm was secretly given, that inertia can identify the "right" k by itself, and
 * that Lloyd's loop can fix a wrong k on its own.
 */
export const kMeansCheck: ConceptCheck = {
  nodeId: "k-means",
  items: [
    {
      id: "nearest-centroid-rule",
      kind: "choice",
      prompt:
        "What actually decides which cluster a point belongs to in k-means?",
      options: [
        {
          label:
            "Whichever centroid is nearest in Euclidean distance — cluster membership is just nearest-centroid assignment",
          correct: true,
          feedback:
            "Right. There are no target labels in the training data. A point joins the cluster whose centroid is closest, and the regions in the plane are exactly those nearest-centroid cells.",
        },
        {
          label:
            "The cluster whose current centroid has the most points, so dense clusters absorb nearby strays",
          feedback:
            "Density is not the rule. A tiny cluster can still own a point if its centroid is closer. k-means assigns by distance alone, not by which group is currently largest.",
        },
        {
          label:
            "The blob humans would naturally draw around it — the algorithm infers semantic groups directly",
          feedback:
            "That is the trap. k-means does not understand 'natural' groups or semantic categories; it only minimises within-cluster squared distance.",
        },
      ],
      difficulty: 2,
      targets: ["kmeans:assignment"],
    },
    {
      id: "inertia-not-enough",
      kind: "choice",
      prompt:
        "Why can't you pick the 'right' k by simply choosing whichever setting gives the lowest inertia?",
      options: [
        {
          label:
            "Because inertia always falls or stays flat as you add centroids, even when the extra clusters stop being meaningful",
          correct: true,
          feedback:
            "Exactly. More centroids can only make points closer to some centre, so the objective keeps improving. The hard part is deciding when the extra tightness no longer buys a useful grouping.",
        },
        {
          label:
            "Because inertia is random from run to run and tells you almost nothing about fit quality",
          feedback:
            "Initialisation can change the exact answer, but inertia is still a real fit measure. The deeper issue is that it rewards tighter distance-based partitions whether or not those partitions match a meaningful grouping.",
        },
        {
          label:
            "Because inertia only matters for supervised learning; unsupervised models don't have an objective",
          feedback:
            "k-means absolutely has an objective — the within-cluster sum of squared distances. The problem is not the absence of an objective; it is that the objective alone cannot tell you the humanly right number of groups.",
        },
      ],
      difficulty: 2,
      targets: ["kmeans:inertia"],
    },
    {
      id: "wrong-k-predict",
      kind: "predict",
      setup:
        "You are looking at three clean blobs, but you are about to rerun k-means with only k = 2 centroids.",
      prompt: "What happens after Lloyd's loop settles?",
      options: [
        {
          label:
            "Two real blobs get merged under one centroid, because the algorithm cannot represent three groups with only two centres",
          correct: true,
          feedback:
            "Right. k-means keeps k fixed. If the data really has three compact groups, forcing k = 2 means one centroid must serve two of them and the fit worsens visibly.",
        },
        {
          label:
            "The loop will eventually split one centroid into two to repair the mismatch on later iterations",
          feedback:
            "Lloyd's loop never changes the number of centroids. It only reassigns points and moves the existing centroids to means of their current clusters.",
        },
        {
          label:
            "Nothing important changes; two centroids can trace the same three blobs just as well if you run enough iterations",
          feedback:
            "More iterations do not add capacity. If k is too small, the model is fundamentally too rigid for the structure in the data and must merge real groups.",
        },
      ],
      verify:
        "Switch Break it to Wrong k and force k = 2. Watch one centroid get pulled into serving two blobs at once.",
      difficulty: 2,
      targets: ["kmeans:wrong-k"],
    },
    {
      id: "break-wrong-k",
      kind: "experiment-task",
      prompt:
        "Break it on purpose: in Break it, switch to Wrong k and force the data's three blobs into k = 2. Watch one centroid merge two natural groups and the inertia spike.",
      taskEvent: "k-means:wrong-k",
      feedback:
        "You just watched k-means solve the wrong question faithfully. The failure was not in Lloyd's loop; it was in choosing a k too small for the structure in the data.",
      difficulty: 1,
      targets: ["kmeans:break"],
    },
    {
      id: "transfer-scale-and-outlier",
      kind: "transfer",
      scenario:
        "A retail team clusters customers using two features: annual spend (0 to 120,000 dollars) and weekly site visits (0 to 25). One luxury client spends far more than everyone else. The analyst runs k-means directly on the raw features and celebrates the result: one cluster is basically just the luxury client, and most of the remaining clusters are arranged almost entirely by spend.",
      prompt:
        "What went wrong, what would you change before trusting the clustering, and what tradeoff would your fix introduce? Write it in your own words.",
      open: {
        placeholder:
          "e.g. k-means is being dominated by … so I would … but the tradeoff is …",
        answer:
          "Two geometric problems are colliding. First, the features are on wildly different scales: spend ranges into the hundreds of thousands while visits only reaches a few dozen, so Euclidean distance is mostly measuring spend and nearly ignoring visits. Second, the luxury client is a genuine outlier, and because k-means minimises squared distance, that one faraway point can pull a centroid toward itself or even claim a whole cluster. Before trusting the result I would standardise the features and inspect the outlier explicitly — deciding whether it is a data error, a special segment that deserves its own treatment, or a sign that k-means is the wrong method. If the outlier is real and important, I might switch to a method less hostage to means and squared distance, such as k-medoids or a density-based approach. The tradeoff is that standardising and downweighting outliers can hide a rare but important customer segment, while switching methods may produce clusters that are less simple to explain than the crisp centroid story of k-means.",
      },
      difficulty: 3,
      targets: ["kmeans:transfer"],
    },
  ],
};
