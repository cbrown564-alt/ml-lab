import { AudioManifestSchema, type AudioManifest } from "@/lib/narrative/audio";
import gradientDescent from "./gradient-descent/audio-manifest.json";
import linearRegression from "./linear-regression/audio-manifest.json";

/**
 * Narration manifests by node (docs/06, B4). Parsed at module load so a
 * malformed manifest is a build error, never a broken player (C3).
 */
export const audioManifests: Record<string, AudioManifest> = Object.fromEntries(
  [linearRegression, gradientDescent].map((m) => {
    const parsed = AudioManifestSchema.parse(m);
    return [parsed.nodeId, parsed];
  }),
);
