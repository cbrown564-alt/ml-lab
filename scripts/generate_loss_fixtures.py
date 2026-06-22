"""Reference fixtures for the loss-functions model layer (docs/06, C4).

The exhibit's claim is that the *choice of loss* changes the fitted line: squared
error (OLS) chases outliers, absolute error (L1/LAD) and Huber resist them. The TS
implementations (IRLS) are verified against an independent optimiser minimising the
*exact* objectives here — scipy.optimize, not a regularised library fit — so the
honesty contract is "same maths, two solvers agree."

Run: python3 scripts/generate_loss_fixtures.py
Output is committed; regenerate only deliberately.
"""

import json
import platform
from pathlib import Path

import numpy as np
import scipy
from scipy import optimize

OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "models" / "fixtures"
HUBER_DELTA = 2.0


def huber(r: np.ndarray, delta: float) -> np.ndarray:
    a = np.abs(r)
    return np.where(a <= delta, 0.5 * r * r, delta * (a - 0.5 * delta))


def fit(x: np.ndarray, y: np.ndarray, loss: str) -> tuple[float, float]:
    A = np.vstack([x, np.ones_like(x)]).T
    ols, *_ = np.linalg.lstsq(A, y, rcond=None)  # slope, intercept start
    if loss == "ols":
        return float(ols[0]), float(ols[1])
    if loss == "mae":
        obj = lambda p: float(np.mean(np.abs(y - (p[0] * x + p[1]))))
        method = "Nelder-Mead"
    else:  # huber
        obj = lambda p: float(np.mean(huber(y - (p[0] * x + p[1]), HUBER_DELTA)))
        method = "Nelder-Mead"
    res = optimize.minimize(
        obj, x0=ols, method=method,
        options={"xatol": 1e-9, "fatol": 1e-12, "maxiter": 20000},
    )
    return float(res.x[0]), float(res.x[1])


def losses(x, y, s, b):
    r = y - (s * x + b)
    return {
        "mse": float(np.mean(r * r)),
        "mae": float(np.mean(np.abs(r))),
        "huber": float(np.mean(huber(r, HUBER_DELTA))),
    }


def dataset(name: str, x: np.ndarray, y: np.ndarray) -> dict:
    out = {"name": name, "points": [{"x": float(a), "y": float(c)} for a, c in zip(x, y)]}
    for loss in ("ols", "mae", "huber"):
        s, b = fit(x, y, loss)
        out[loss] = {"slope": s, "intercept": b, "losses": losses(x, y, s, b)}
    return out


def main() -> None:
    rng = np.random.default_rng(7)
    cases = []

    # A clean trend: all three losses essentially agree (the lines overlap).
    x = np.linspace(0, 10, 24)
    cases.append(dataset("clean", x, 2.0 * x + 3.0 + rng.normal(0, 1.0, x.size)))

    # The same trend with high-leverage outliers near the right end, all pulled the
    # same way: squared error tilts the whole line up to chase them, while L1/Huber
    # hold the bulk trend. The gap between the lines is the whole lesson.
    x = np.linspace(0, 10, 24)
    y = 2.0 * x + 3.0 + rng.normal(0, 1.0, x.size)
    y[20] += 22.0
    y[22] += 25.0
    y[23] += 20.0
    cases.append(dataset("with-outliers", x, y))

    OUT.mkdir(parents=True, exist_ok=True)
    payload = {
        "generator": {
            "script": "scripts/generate_loss_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "scipy": scipy.__version__,
            "huberDelta": HUBER_DELTA,
            "seed": 7,
        },
        "cases": cases,
    }
    path = OUT / "loss-functions.json"
    path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {path} ({len(cases)} cases, huber delta {HUBER_DELTA})")


if __name__ == "__main__":
    main()
