"""Reference fixtures for logistic regression (classification cluster).

A 2-D, two-class dataset (two Gaussian blobs with honest overlap), and the
maximum-likelihood logistic fit computed by scipy.optimize — the reference the TS
gradient-descent fit must match. scipy/numpy only, no sklearn.

Run: python3 scripts/generate_logistic_fixtures.py
"""

import json
import platform
from pathlib import Path

import numpy as np
from scipy.optimize import minimize

OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "models" / "fixtures"
SEED = 4
L2 = 1e-3  # a whisker of regularisation so the MLE is finite under separation


def neg_log_likelihood(w, X, y):
    z = X @ w
    # stable log(1+e^z): logaddexp(0, z)
    ll = np.sum(y * z - np.logaddexp(0, z))
    return -ll + 0.5 * L2 * np.sum(w[1:] ** 2)


def main() -> None:
    rng = np.random.default_rng(SEED)
    n = 30  # per class
    c0 = rng.normal([-1.1, -0.7], 0.85, size=(n, 2))
    c1 = rng.normal([1.1, 0.7], 0.85, size=(n, 2))
    X2 = np.vstack([c0, c1])
    y = np.array([0] * n + [1] * n, dtype=float)
    # round for a compact, reproducible fixture
    X2 = np.round(X2, 3)

    X = np.column_stack([np.ones(len(X2)), X2])  # design with bias column
    res = minimize(neg_log_likelihood, np.zeros(3), args=(X, y), method="BFGS")
    w = res.x  # [b, w1, w2]

    # accuracy + mean log-loss at the optimum, for the test to check against
    z = X @ w
    p = 1 / (1 + np.exp(-z))
    acc = float(np.mean((p >= 0.5) == (y == 1)))
    logloss = float(np.mean(-(y * np.log(p) + (1 - y) * np.log(1 - p))))

    payload = {
        "generator": {
            "script": "scripts/generate_logistic_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "method": "scipy.optimize.minimize BFGS on the L2-penalised neg-log-likelihood",
            "seed": SEED, "l2": L2,
        },
        "points": [{"x1": float(a), "x2": float(b), "y": int(c)} for (a, b), c in zip(X2, y)],
        "weights": {"b": float(w[0]), "w1": float(w[1]), "w2": float(w[2])},
        "accuracy": acc,
        "logLoss": logloss,
    }
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "logistic.json"
    path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {path}")
    print(f"  weights b={w[0]:+.3f} w1={w[1]:+.3f} w2={w[2]:+.3f}")
    print(f"  accuracy={acc:.3f}  mean log-loss={logloss:.3f}")


if __name__ == "__main__":
    main()
