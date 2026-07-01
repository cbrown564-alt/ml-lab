import { foundations } from "@content/journeys/foundations";
import { JourneyTrail } from "@/components/learner/JourneyTrail";

/** Foundations journey rail — thin wrapper for the shared trail component. */
export function FoundationsTrail() {
  return <JourneyTrail journey={foundations} />;
}
