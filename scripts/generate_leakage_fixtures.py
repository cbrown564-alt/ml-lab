"""Reference fixtures for the data-leakage exhibit (the ESL feature-selection trap).

Pure-noise features and a pure-noise target — there is genuinely nothing to predict.
But if you pick the features most correlated with the target using ALL the data and
THEN cross-validate, the selection has already peeked at every test fold, so CV
reports confident skill that isn't there. Do the selection inside each fold instead
and the score collapses to ~0, the truth. numpy computes both so the TS reproduction
can be checked exactly. numpy only — no sklearn.

Run: python3 scripts/generate_leakage_fixtures.py
"""

import json
import platform
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "models" / "fixtures"
# Kept small enough that the noise matrix fits the client JS budget; still p≫ enough
# that the best chance correlation (≈√(2·ln p / n)) is large and the leak bites.
N, P, K_SELECT, FOLDS = 64, 72, 10, 4
SEED = 8  # chosen so the leak bites cleanly: leaky R² ≈ 0.41, honest ≈ −0.08 (~0)
ROUND = 3  # decimals — the reference is computed from the rounded matrix so TS matches


def fit_predict_r2(Xtr, ytr, Xte, yte):
    # OLS with a whisker of ridge for stability; out-of-sample R² vs the train mean.
    A = np.column_stack([np.ones(len(Xtr)), Xtr])
    w = np.linalg.solve(A.T @ A + 1e-6 * np.eye(A.shape[1]), A.T @ ytr)
    pred = np.column_stack([np.ones(len(Xte)), Xte]) @ w
    ss_res = float(np.sum((yte - pred) ** 2))
    ss_tot = float(np.sum((yte - ytr.mean()) ** 2)) or 1e-9
    return 1.0 - ss_res / ss_tot


def top_k(X, y, k):
    # indices of the k features most correlated (abs) with y
    cors = np.array([abs(np.corrcoef(X[:, j], y)[0, 1]) for j in range(X.shape[1])])
    return list(np.argsort(-cors)[:k])


def cross_val(X, y, folds, leaky):
    n = len(y)
    bounds = [round(i * n / folds) for i in range(folds + 1)]
    sel_global = top_k(X, y, K_SELECT) if leaky else None
    scores = []
    for f in range(folds):
        te = list(range(bounds[f], bounds[f + 1]))
        tr = [i for i in range(n) if i not in te]
        sel = sel_global if leaky else top_k(X[tr], y[tr], K_SELECT)
        scores.append(fit_predict_r2(X[np.ix_(tr, sel)], y[tr], X[np.ix_(te, sel)], y[te]))
    return scores


def main() -> None:
    rng = np.random.default_rng(SEED)
    # Round at generation time and compute the reference from the rounded values, so
    # the shipped fixture and the TS reproduction operate on identical numbers.
    X = np.round(rng.standard_normal((N, P)), ROUND)
    y = np.round(rng.standard_normal(N), ROUND)  # independent of X — no real signal

    leaky = cross_val(X, y, FOLDS, leaky=True)
    honest = cross_val(X, y, FOLDS, leaky=False)

    payload = {
        "generator": {
            "script": "scripts/generate_leakage_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "note": "X and y are independent standard normals — true predictive skill is 0.",
            "n": N, "p": P, "kSelect": K_SELECT, "folds": FOLDS, "seed": SEED,
        },
        "X": [[float(v) for v in row] for row in X],
        "y": [float(v) for v in y],
        "leakyFoldR2": leaky,
        "honestFoldR2": honest,
        "leakyMeanR2": float(np.mean(leaky)),
        "honestMeanR2": float(np.mean(honest)),
    }
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "leakage.json"
    path.write_text(json.dumps(payload) + "\n")
    print(f"wrote {path}")
    print(f"  leaky CV R²  = {payload['leakyMeanR2']:+.3f}  (manufactured skill)")
    print(f"  honest CV R² = {payload['honestMeanR2']:+.3f}  (the truth: ~0)")


if __name__ == "__main__":
    main()
