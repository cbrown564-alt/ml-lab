import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { GradientDescentLab } from "@/components/exhibits/GradientDescentLab";

export default function GradientDescentExhibit() {
  return (
    <ExhibitFrame
      nodeId="gradient-descent"
      lede={
        <p>
          The engine under nearly everything. A model starts out wrong,
          measures exactly how wrong, and takes one small step downhill — then
          does it again, a few thousand times. Here you hold the clock: step,
          play, scrub back through time, and turn the one knob that decides
          whether the walk converges, crawls, or explodes.
        </p>
      }
    >
      <GradientDescentLab />
    </ExhibitFrame>
  );
}
