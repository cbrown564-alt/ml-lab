import type { FailureGallery } from "@/lib/failure/schema";
import { queenCosineFromKing } from "./experiment";

export const embeddingsFailures: FailureGallery = {
  nodeId: "embeddings",
  intro:
    "Embeddings fail when the coordinate system does not match the task — one-hot orthogonality, PCA variance chasing, or stale vectors under domain shift.",
  cards: [
    {
      id: "one-hot-no-geometry",
      primitive: "underfitting",
      title: "One-hot encoding — every word equidistant",
      trigger: "Represent each token as an orthogonal corner in a sparse space instead of a dense embedding.",
      symptom:
        "Cosine similarity is zero between every pair — the model must memorize each word in isolation with no transfer from similar usages.",
      diagnosis:
        "Without dense coordinates, there is no notion of neighbour. Every prediction starts from scratch.",
      repair:
        "Learn dense embeddings (or use a pretrained table) so similar contexts share parameters.",
      boundary:
        "One-hot is fine for tiny categorical features with no semantic structure — not for open vocabulary language.",
    },
    {
      id: "pca-not-task-tuned",
      primitive: "spurious-features",
      title: "PCA axes chase variance, not analogy",
      trigger: "Use PCA on raw co-occurrence counts as your 'embedding' for downstream attention.",
      symptom:
        "Clusters may appear, but relational directions like gender fail — king − man + woman no longer lands near queen.",
      diagnosis:
        "PCA finds directions of spread in fixed features. It never optimises for the prediction task that makes analogies linear.",
      repair:
        "Train embeddings with the model objective, or start from pretrained vectors tuned on massive context.",
      boundary:
        "PCA is still a fine exploratory lens on tabular features — just not a substitute for task-learned token vectors.",
    },
    {
      id: "domain-shift-geometry",
      primitive: "distribution-shift",
      title: "Embeddings trained elsewhere mis-route attention",
      trigger: "Deploy vectors trained on news text to a medical chatbot without adaptation.",
      symptom:
        "Nearest neighbours look plausible but mislead — domain terms sit in the wrong valleys and attention copies the wrong context.",
      diagnosis:
        "Geometry encodes the training corpus. New domains move words to different neighbourhoods in usage.",
      repair:
        "Fine-tune embeddings (or the layers above them) on in-domain text; monitor neighbour drift in validation.",
      boundary:
        "Full retraining is expensive — sometimes adapter layers are enough if the base geometry is still broadly useful.",
    },
  ],
};
