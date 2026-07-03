import type { ExhibitNarrative } from "@/lib/narrative/schema";

export const embeddingsNarrative: ExhibitNarrative = {
  nodeId: "embeddings",
  hook: [
    "A language model never sees the word king as a string of four letters. It sees a vector — a list of numbers that becomes a point in a high-dimensional space. Tokens that behave similarly in context are pushed nearby; unrelated tokens drift apart. Every later mechanism in a transformer — attention especially — operates on this geometry.",
    "That is an embedding: a learned coordinate system for discrete objects. It is not a lookup table of definitions. It is a map where distance and direction carry meaning, trained so that the model's prediction task pulls similar usages together.",
  ],
  story: [
    {
      id: "similarity-is-distance",
      heading: "Similarity becomes distance",
      paragraphs: [
        "Pick an anchor word and ask who its neighbours are. Cosine similarity measures the angle between two vectors — near 1 means they point the same way, near 0 means unrelated. On the committed map, king's closest neighbours are queen, prince, and woman — royalty and gender cluster before animals or verbs appear.",
        "This is the whole retrieval story in miniature. Search, recommendation, and attention all reduce to 'which vectors sit close to which' once everything lives in the same space.",
      ],
    },
    {
      id: "vector-analogy",
      heading: "Analogies become vector arithmetic",
      paragraphs: [
        "Take the offset from man to woman — a gender direction — and add it to king. In the learned space the result lands on queen within rounding error. That famous word2vec party trick is not magic: the training objective (predict a word from its context) forces consistent relational directions to appear as consistent vector offsets.",
        "You cannot get that from a one-hot encoding, where every word is an orthogonal corner and no two words are closer than any others. You need a dense, learned space.",
      ],
    },
    {
      id: "pca-contrast",
      heading: "Not every compression is an embedding",
      paragraphs: [
        "PCA on a table of co-occurrence counts also produces a 2-D scatter — but the axes are 'directions of variance,' not 'directions that answer the task.' Toggle to PCA in Run it: royalty still groups loosely, but the crisp gender offset that makes king − man + woman work is gone.",
        "Both PCA and embeddings compress — the difference is who chooses the coordinates. PCA is a fixed linear rotation of the raw features. Embeddings are coordinates learned end-to-end so the downstream model can predict.",
      ],
    },
    {
      id: "hierarchy",
      heading: "From pixels to tokens to vectors",
      paragraphs: [
        "CNNs built hierarchical embeddings in space: edges, then textures, then parts. Language models build embeddings in sequence: tokens become vectors, then attention mixes them into contextual vectors. The exhibit you just left (convolution) made spatial structure explicit; here the structure is semantic.",
        "Attention — the next stop on the journey — reads these vectors and decides which ones to blend. Without a sensible embedding geometry, attention would have nothing meaningful to route.",
      ],
    },
  ],
  fieldNotes: [
    "Real models use hundreds or thousands of dimensions, not two. The 2-D map is a teaching projection — the mechanics (similarity, analogy, learning vs PCA) survive at full scale.",
    "Embeddings carry bias from training data: gender, stereotype, and frequency effects can all show up as directions in the space. Geometry is powerful and not neutral.",
  ],
};
