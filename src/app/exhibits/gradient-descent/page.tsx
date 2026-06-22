import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { GradientDescentHero } from "@/components/exhibits/GradientDescentHero";
import { GradientDescentLab } from "@/components/exhibits/GradientDescentLab";
import { GradientDescentStory } from "@/components/exhibits/GradientDescentStory";
import { gradientDescentCheck } from "@content/exhibits/gradient-descent/concept-check";
import { gradientDescentMath } from "@content/exhibits/gradient-descent/math";
import { gradientDescentNarrative } from "@content/exhibits/gradient-descent/narrative";
import { gradientDescentSpine } from "@content/exhibits/gradient-descent/spine";

export default function GradientDescentExhibit() {
  return (
    <ExhibitFrame
      nodeId="gradient-descent"
      check={gradientDescentCheck}
      narrative={gradientDescentNarrative}
      spine={gradientDescentSpine}
      math={gradientDescentMath}
      hero={<GradientDescentHero />}
      lede={
        <p>
          The engine under nearly everything. A model starts out wrong,
          measures exactly how wrong, and takes one small step downhill — then
          does it again, a few thousand times. Here you hold the clock: step,
          play, scrub back through time, and turn the one knob that decides
          whether the walk converges, crawls, or explodes.
        </p>
      }
      promise={
        <>
          Stay twenty minutes and you&apos;ll see why too timid a step never
          arrives and too bold a step blows up — the same misstep behind most
          training runs that die.
        </>
      }
      story={<GradientDescentStory />}
      experiment={<GradientDescentLab />}
    />
  );
}
