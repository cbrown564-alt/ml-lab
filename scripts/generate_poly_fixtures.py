"""Reference fixtures for the polynomial + ridge model (bias-variance, regularisation).

The TS `ridgeFit` solves (XᵀX + λD)w = Xᵀy by Gaussian elimination; numpy solves the
same system here, so the two must agree (docs/06 C4). Also emits a train/test split
from a smooth target so the exhibits can show train-error-down / test-error-U and the
ridge smoothing. numpy only — no sklearn.

Run: python3 scripts/generate_poly_fixtures.py
"""

import json
import platform
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "models" / "fixtures"


def target(x):
    return np.sin(1.5 * np.pi * x)  # smooth ground truth on x in [0, 1]


def ridge_fit(x, y, degree, lam):
    X = np.vander(x, degree + 1, increasing=True)  # [1, x, x², …]
    d = degree + 1
    D = np.eye(d)
    D[0, 0] = 0.0  # don't penalise the intercept
    w = np.linalg.solve(X.T @ X + lam * D, X.T @ y)
    return [float(v) for v in w]


def main() -> None:
    rng = np.random.default_rng(11)
    xt = np.sort(rng.uniform(0, 1, 16))
    yt = target(xt) + rng.normal(0, 0.18, xt.size)
    xv = np.sort(rng.uniform(0, 1, 16))
    yv = target(xv) + rng.normal(0, 0.18, xv.size)

    pts = lambda x, y: [{"x": float(a), "y": float(b)} for a, b in zip(x, y)]

    # Verification cases (moderate degree → well-conditioned, exact agreement).
    checks = []
    for degree, lam in [(3, 0.0), (5, 0.0), (5, 0.05), (7, 0.01)]:
        checks.append({
            "degree": degree,
            "lambda": lam,
            "weights": ridge_fit(xt, yt, degree, lam),
        })

    payload = {
        "generator": {
            "script": "scripts/generate_poly_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "target": "sin(1.5*pi*x) on [0,1] + noise(0.18)",
            "seed": 11,
        },
        "train": pts(xt, yt),
        "test": pts(xv, yv),
        "checks": checks,
    }
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "polynomial.json"
    path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {path} ({len(checks)} check fits, {len(payload['train'])} train pts)")


if __name__ == "__main__":
    main()
