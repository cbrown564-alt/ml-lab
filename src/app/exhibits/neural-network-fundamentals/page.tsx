import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { NeuralNetBreakIt } from "@/components/exhibits/NeuralNetBreakIt";
import { NeuralNetCheckLab } from "@/components/exhibits/NeuralNetCheckLab";
import { NeuralNetLab } from "@/components/exhibits/NeuralNetLab";
import { NeuralNetHero } from "@/components/exhibits/NeuralNetHero";
import { NeuralNetStory } from "@/components/exhibits/NeuralNetStory";
import { neuralNetworkFundamentalsCheck } from "@content/exhibits/neural-network-fundamentals/concept-check";
import { neuralNetworkFundamentalsFailures } from "@content/exhibits/neural-network-fundamentals/failures";
import { neuralNetworkFundamentalsMath } from "@content/exhibits/neural-network-fundamentals/math";
import { neuralNetworkFundamentalsNarrative } from "@content/exhibits/neural-network-fundamentals/narrative";
import { neuralNetworkFundamentalsSpine } from "@content/exhibits/neural-network-fundamentals/spine";

export default function NeuralNetworkFundamentalsExhibit() {
  return (
    <ExhibitFrame
      nodeId="neural-network-fundamentals"
      narrative={neuralNetworkFundamentalsNarrative}
      spine={neuralNetworkFundamentalsSpine}
      math={neuralNetworkFundamentalsMath}
      check={neuralNetworkFundamentalsCheck}
      failures={neuralNetworkFundamentalsFailures}
      breakIt={<NeuralNetBreakIt />}
      checkCompanion={<NeuralNetCheckLab />}
      hero={<NeuralNetHero />}
      story={<NeuralNetStory />}
      experiment={<NeuralNetLab />}
      lede={
        <p>
          A neural network composes weighted sums with nonlinear activations. A single linear
          unit draws one straight boundary; hidden units and nonlinearities let the model
          represent more complex shapes.
        </p>
      }
      promise={
        <>
          You&apos;ll watch a small network learn XOR, see why the activation matters, and
          test how too little or too much capacity changes generalization.
        </>
      }
      experimentLede={
        <>
          Train the network and inspect the boundary and weights as they change. Vary the
          hidden-unit count to compare underfitting, a workable fit, and overfitting on
          noisy data.
        </>
      }
    />
  );
}
