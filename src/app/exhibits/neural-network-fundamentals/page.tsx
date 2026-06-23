import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { NeuralNetLab } from "@/components/exhibits/NeuralNetLab";
import { NeuralNetStory } from "@/components/exhibits/NeuralNetStory";
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
      story={<NeuralNetStory />}
      experiment={<NeuralNetLab />}
      lede={
        <p>
          A single neuron can only draw a straight line — and some patterns have no line.
          The fix that started deep learning is almost too simple: stack neurons, put a
          squiggle between them, and let the boundary bend into any shape at all.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll watch a network <em>learn</em> XOR from
          scratch — the boundary bending into the X, the weights thickening and flipping —
          and you&apos;ll know why the nonlinearity between the layers is the whole trick.
        </>
      }
      experimentLede={
        <>
          Guardrails off. Press Train and watch a small network bend its decision boundary
          into the XOR X in real time; change the hidden-unit count to feel how much shape
          it can afford — drop to one and watch it stall.
        </>
      }
    />
  );
}
