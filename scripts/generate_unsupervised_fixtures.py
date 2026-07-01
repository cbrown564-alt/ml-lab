"""Reference fixtures for the unsupervised cluster (k-means · PCA).

Shared honesty contract: TypeScript model layers verify against scikit-learn on
the same committed data learners manipulate in the lab.

Run: python scripts/generate_unsupervised_fixtures.py
Output is committed; regenerate only deliberately.
"""

import json
import platform
from pathlib import Path

import numpy as np
import sklearn
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "models" / "fixtures"
SEED = 11


def points_2d(X: np.ndarray, labels: np.ndarray | None = None) -> list[dict]:
    out = []
    for i, (a, b) in enumerate(X):
        row: dict = {"x1": float(round(a, 3)), "x2": float(round(b, 3))}
        if labels is not None:
            row["label"] = int(labels[i])
        out.append(row)
    return out


def kmeans_fixture() -> None:
    """Three well-separated blobs — k=3 is honest; k=2 and k=5 are teaching cases."""
    X, y = make_blobs(
        n_samples=120,
        centers=3,
        cluster_std=0.55,
        random_state=SEED,
    )
    X = np.round(X, 3)
    domain = [
        float(np.floor(X[:, 0].min() - 1)),
        float(np.ceil(X[:, 0].max() + 1)),
    ]
    domain_y = [
        float(np.floor(X[:, 1].min() - 1)),
        float(np.ceil(X[:, 1].max() + 1)),
    ]

    by_k = []
    inits = []
    for k in [2, 3, 5]:
        km = KMeans(n_clusters=k, n_init=10, random_state=SEED).fit(X)
        by_k.append(
            {
                "k": k,
                "inertia": float(km.inertia_),
                "centroids": [
                    {"x1": float(round(c[0], 3)), "x2": float(round(c[1], 3))}
                    for c in km.cluster_centers_
                ],
                "labels": [int(v) for v in km.labels_],
            }
        )

    # Fixed init for the lab: two seeds placed badly (both in one blob) — a teaching init.
    bad_init = np.array([[X[0, 0], X[0, 1]], [X[1, 0], X[1, 1]]], dtype=float)
    km_bad = KMeans(n_clusters=2, init=bad_init, n_init=1, random_state=SEED).fit(X)

    payload = {
        "generator": {
            "script": "scripts/generate_unsupervised_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "sklearn": sklearn.__version__,
            "dataset": "sklearn.make_blobs, 3 centres, seed 11",
            "seed": SEED,
        },
        "domain": [domain[0], domain[1]],
        "yDomain": domain_y,
        "points": points_2d(X, y),
        "byK": by_k,
        "badInitK2": {
            "init": [
                {"x1": float(bad_init[0, 0]), "x2": float(bad_init[0, 1])},
                {"x1": float(bad_init[1, 0]), "x2": float(bad_init[1, 1])},
            ],
            "labels": [int(v) for v in km_bad.labels_],
            "centroids": [
                {"x1": float(round(c[0], 3)), "x2": float(round(c[1], 3))}
                for c in km_bad.cluster_centers_
            ],
            "inertia": float(km_bad.inertia_),
        },
        "iterations": [],
    }

    # Lloyd steps for k=3 from a deliberate start — the animation reference.
    init3 = np.array(
        [
            [X[0, 0], X[0, 1]],
            [X[40, 0], X[40, 1]],
            [X[80, 0], X[80, 1]],
        ],
        dtype=float,
    )
    labels = np.zeros(len(X), dtype=int)
    centroids = init3.copy()
    for _ in range(12):
        dists = np.linalg.norm(X[:, None, :] - centroids[None, :, :], axis=2)
        labels = np.argmin(dists, axis=1)
        new_c = np.array(
            [X[labels == j].mean(axis=0) if np.any(labels == j) else centroids[j] for j in range(3)]
        )
        if np.allclose(new_c, centroids):
            break
        centroids = new_c
        payload["iterations"].append(
            {
                "centroids": [
                    {"x1": float(round(c[0], 3)), "x2": float(round(c[1], 3))} for c in centroids
                ],
                "labels": [int(v) for v in labels],
                "inertia": float(
                    sum(np.sum((X[labels == j] - centroids[j]) ** 2) for j in range(3))
                ),
            }
        )

    path = OUT / "k-means.json"
    path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {path} ({len(X)} points, {len(payload['iterations'])} Lloyd steps)")


def pca_fixture() -> None:
    """Correlated 2-D cloud — PC1 is the long axis, PC2 the short one."""
    rng = np.random.default_rng(SEED)
    n = 100
    t = rng.normal(0, 1, n)
    noise = rng.normal(0, 0.15, (n, 2))
    X = np.column_stack([2.2 * t, 0.6 * t]) + noise
    X = np.round(X, 3)

    scaler = StandardScaler().fit(X)
    Xs = scaler.transform(X)
    pca = PCA(n_components=2, random_state=SEED).fit(Xs)

    mean = scaler.mean_
    scale = scaler.scale_
    components = pca.components_
    explained = pca.explained_variance_ratio_.tolist()

    # Projections for the scatter readout
    proj = pca.transform(Xs)

    payload = {
        "generator": {
            "script": "scripts/generate_unsupervised_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "sklearn": sklearn.__version__,
            "dataset": "correlated 2-D Gaussian cloud, seed 11",
            "seed": SEED,
        },
        "domain": [float(np.floor(X[:, 0].min() - 0.5)), float(np.ceil(X[:, 0].max() + 0.5))],
        "yDomain": [float(np.floor(X[:, 1].min() - 0.5)), float(np.ceil(X[:, 1].max() + 0.5))],
        "points": points_2d(X),
        "mean": {"x1": float(round(mean[0], 4)), "x2": float(round(mean[1], 4))},
        "scale": {"x1": float(round(scale[0], 4)), "x2": float(round(scale[1], 4))},
        "components": [
            {
                "pc": 1,
                "vector": {"x1": float(round(components[0, 0], 4)), "x2": float(round(components[0, 1], 4))},
                "explainedVarianceRatio": float(explained[0]),
            },
            {
                "pc": 2,
                "vector": {"x1": float(round(components[1, 0], 4)), "x2": float(round(components[1, 1], 4))},
                "explainedVarianceRatio": float(explained[1]),
            },
        ],
        "projections": [
            {"pc1": float(round(a, 3)), "pc2": float(round(b, 3))} for a, b in proj
        ],
        "reconstructionError1D": float(
            np.mean(np.sum((Xs - np.outer(proj[:, 0], components[0])) ** 2, axis=1))
        ),
    }

    path = OUT / "pca.json"
    path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {path} (explained {explained[0]:.1%} / {explained[1]:.1%})")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    kmeans_fixture()
    pca_fixture()


if __name__ == "__main__":
    main()
