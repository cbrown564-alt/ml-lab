"""Generate reference fixtures for model-layer tests (docs/06, C4).

The TypeScript model implementations (and later the Python code-mode
templates) are verified against scikit-learn on the same data — the honesty
contract between what learners read and what the lab computes.

Run: python scripts/generate_fixtures.py
Output is committed; regenerate only deliberately.
"""

import json
import platform
from pathlib import Path

import numpy as np
import sklearn
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "models" / "fixtures"


def dataset(name: str, x: np.ndarray, y: np.ndarray) -> dict:
    model = LinearRegression().fit(x.reshape(-1, 1), y)
    pred = model.predict(x.reshape(-1, 1))
    return {
        "name": name,
        "points": [{"x": float(a), "y": float(b)} for a, b in zip(x, y)],
        "ols": {"slope": float(model.coef_[0]), "intercept": float(model.intercept_)},
        "mseAtOls": float(mean_squared_error(y, pred)),
    }


def main() -> None:
    rng = np.random.default_rng(42)
    cases = []

    x = np.linspace(0, 10, 30)
    cases.append(dataset("clean-linear", x, 2.5 * x + 1.0 + rng.normal(0, 1.0, x.size)))

    x = rng.uniform(-5, 5, 50)
    cases.append(dataset("noisy-wide", x, -1.2 * x + 4.0 + rng.normal(0, 3.0, x.size)))

    x = np.linspace(0, 1, 12)
    cases.append(dataset("tiny-scale", x, 0.05 * x + 0.001 + rng.normal(0, 0.01, x.size)))

    x = np.concatenate([np.linspace(0, 10, 28), [5.0, 6.0]])
    y = 1.5 * x + 2.0 + rng.normal(0, 0.8, x.size)
    y[-2:] += [25.0, -20.0]  # outliers pull the fit — used by the failure gallery too
    cases.append(dataset("with-outliers", x, y))

    x = np.full(10, 3.0) + rng.normal(0, 1e-9, 10)
    cases.append(dataset("near-degenerate-x", x, rng.normal(5, 1, 10)))

    # Gradient descent's own dataset (not shared with the linear-regression
    # exhibit). Uncentered x with a high intercept makes the (slope, intercept)
    # loss bowl elongated and tilted, and the flat-line start sits across its
    # narrow axis — so descent from (0,0) zigzags down the valley instead of
    # sliding straight in: the classic picture, and what makes it "feel like
    # learning". Its own rng (seed 42) keeps it independent of the cases above.
    rng_gd = np.random.default_rng(42)
    x = np.linspace(0, 6, 30)
    cases.append(dataset("gd-zigzag", x, 2.0 * x + 6.0 + rng_gd.normal(0, 1.0, x.size)))

    OUT.mkdir(parents=True, exist_ok=True)
    payload = {
        "generator": {
            "script": "scripts/generate_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "sklearn": sklearn.__version__,
            "seed": 42,
        },
        "cases": cases,
    }
    path = OUT / "linear-regression.json"
    path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {path} ({len(cases)} cases)")


if __name__ == "__main__":
    main()
