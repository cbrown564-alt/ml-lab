import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Neural-network concept check. Misconceptions: that more units is always better, that the
 * nonlinearity is incidental, and that depth alone (without it) buys expressiveness.
 */
export const neuralNetworkFundamentalsCheck: ConceptCheck = {
  nodeId: "neural-network-fundamentals",
  items: [
    {
      id: "why-nonlinearity",
      kind: "choice",
      prompt: "Why is the nonlinearity (the tanh) between the layers essential — not just a detail?",
      options: [
        {
          label: "Without it, a stack of linear layers collapses to a single linear map — still just a line, no matter the depth",
          correct: true,
          feedback:
            "Right. W₂(W₁x) = (W₂W₁)x = Wx. The nonlinearity between the layers is the only thing that lets stacked neurons represent curves; remove it and depth buys nothing.",
        },
        {
          label: "It speeds up training but the network is equally expressive without it",
          feedback:
            "It's not about speed — it's about what the network can represent. Strip the nonlinearity and the whole stack is algebraically one linear layer, unable to fit XOR at all.",
        },
        {
          label: "It keeps the outputs between 0 and 1 for probabilities",
          feedback:
            "That's the final sigmoid's job. The hidden nonlinearity is about expressiveness: it's what bends the decision boundary. Without it, no amount of depth makes a curve.",
        },
      ],
      difficulty: 2,
      targets: ["nn:nonlinearity"],
    },
    {
      id: "capacity-overfit",
      kind: "choice",
      prompt: "A big network hit 97% on the training set but only 82% on held-out data, while a small one got ~90% on both. What happened?",
      options: [
        {
          label: "The big network had the capacity to memorise the training noise — it overfit; the small one learned the rule and generalised",
          correct: true,
          feedback:
            "Exactly. The train-test gap is the tell. Extra capacity let the big net fit individual noisy points (islands in the boundary), which doesn't transfer. More units is the wrong fix here.",
        },
        {
          label: "The big network just needs more training to close the gap",
          feedback:
            "More training widens the gap, not closes it — it lets the big net memorise the noise even more thoroughly. The fix is less capacity or regularisation, not more epochs.",
        },
        {
          label: "The held-out set was simply harder than the training set",
          feedback:
            "Both sets are from the same distribution; the small net scored ~90% on the held-out set. The big net's drop is overfitting — it learned the train noise, which the test set doesn't share.",
        },
      ],
      difficulty: 2,
      targets: ["nn:overfit"],
    },
    {
      id: "one-unit-predict",
      kind: "predict",
      setup: "You set the hidden layer to a single unit and train it on XOR.",
      prompt: "What's the best accuracy it can reach?",
      options: [
        {
          label: "Around 75% — one unit is essentially one bend, which can't carve XOR's four alternating quadrants",
          correct: true,
          feedback:
            "Right. A single tanh unit gives one ridge; it can separate two of the four quadrants but not all. It's a capacity limit, not a training one — no amount of data or epochs fixes it.",
        },
        {
          label: "100% — one hidden unit is still a full network, so it can learn anything",
          feedback:
            "Being a network isn't enough — XOR needs more than one hidden unit to carve the X (a few train it reliably). One unit lacks the capacity and tops out around 75%, a coin flip better than chance.",
        },
        {
          label: "50% — one hidden unit is no better than guessing",
          feedback:
            "It does a bit better than chance — one bend can get one pair of quadrants right (~75%). But it can't reach the X. A few units do.",
        },
      ],
      verify: "One hidden unit ≈ one bend — it stalls near 75% on XOR, a capacity limit.",
      difficulty: 2,
      targets: ["nn:capacity"],
    },
    {
      id: "break-overfit",
      kind: "experiment-task",
      prompt: "Break it on purpose: push the hidden units up on the noisy data and watch the boundary grow islands around individual points while the held-out score drops — overfitting in real time.",
      taskEvent: "neural-network-fundamentals:overfitting",
      feedback:
        "You've seen capacity cut both ways: enough to learn the rule is good, enough to memorise the noise is overfitting. The held-out gap, not the train score, is what tells you which.",
      difficulty: 1,
      targets: ["nn:break"],
    },
    {
      id: "transfer-bigger-model",
      kind: "transfer",
      scenario:
        "A team's network underperforms. They double its size; training loss drops to near zero but the validation score gets worse. Someone proposes doubling the size again.",
      prompt: "From what you've learned, what's happening and what should they do instead?",
      options: [
        {
          label:
            "Near-zero training loss with worse validation is overfitting — more capacity will deepen it; instead reduce size or add regularisation, and judge by the held-out score",
          correct: true,
          feedback:
            "That's the transfer: training loss going to zero is the warning, not the goal. The validation gap means it's memorising. Bigger makes it worse; regularisation or less capacity, chosen on validation, is the fix.",
        },
        {
          label: "The model is still too small — doubling again will finally fit the data",
          feedback:
            "It already fits the training data (loss near zero); the problem is it fits it too well. More capacity memorises more noise and widens the validation gap. Size isn't the lever here.",
        },
        {
          label: "Training loss near zero proves it's working — the validation metric must be miscomputed",
          feedback:
            "Near-zero training loss with rising validation loss is the textbook signature of overfitting, not a metric bug. The model generalises worse precisely because it nailed the training set.",
        },
      ],
      difficulty: 3,
      targets: ["nn:transfer-capacity"],
    },
  ],
};
