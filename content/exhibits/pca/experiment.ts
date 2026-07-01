import fixture from "@/lib/models/fixtures/pca.json";
import {
  fitPCA,
  project,
  reconstruct,
  reconstructionError,
  type PCAProjection,
  type Point2D,
} from "@/lib/models/pca";

/**
 * PCA experiment data. The shared fixture is a 2-D cloud with strong correlation:
 * enough redundancy that one rotated axis captures almost everything. The lab keeps
 * the same 100 points throughout and lets the learner decide how many components to
 * keep, while Break it compares the same cloud with and without standardization.
 */
export const pcaPoints = fixture.points as Point2D[];
export const pcaDomain = fixture.domain as [number, number];
export const pcaYDomain = fixture.yDomain as [number, number];

export const pcaFit = fitPCA(pcaPoints);
export const pcaRawFit = fitPCA(pcaPoints, { standardize: false });

export const pcaProjections = project(pcaPoints, pcaFit.components, pcaFit);
export const pcaProjectionReference = fixture.projections as PCAProjection[];
export const pcaReconstruction1D = reconstruct(pcaProjections, pcaFit.components, pcaFit, 1);
export const pcaReconstruction2D = reconstruct(pcaProjections, pcaFit.components, pcaFit, 2);
export const pcaReconstructionError1D = reconstructionError(
  pcaPoints,
  pcaReconstruction1D,
  pcaFit,
);

function padDomain(values: number[], padding = 0.2): [number, number] {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return [lo - padding, hi + padding];
}

export const pcaProjectionDomain = padDomain(pcaProjections.map((projection) => projection.pc1));
export const pcaProjectionStripYDomain: [number, number] = [-0.6, 0.6];

export const pcaComponentToggles = [
  {
    id: "pc1",
    label: "Keep PC1 only",
    components: 1 as const,
    hint: "maximum compression, small reconstruction loss",
  },
  {
    id: "pc12",
    label: "Keep PC1 + PC2",
    components: 2 as const,
    hint: "full 2-D reconstruction",
  },
] as const;

export const pcaScenario = {
  id: "correlated-cloud",
  title: "One axis carries almost everything",
  prompt:
    "These two measurements move together so strongly that the cloud is really a tilted line with a little thickness. PCA rotates the axes to match that shape. Keep only PC1 and you compress every point to one number; add PC2 back and the reconstruction becomes exact again.",
};
