"""Reference fixtures for the trees cluster (decision tree → random forest → boosting).

One shared 2-D, two-class dataset (sklearn `make_moons` with honest noise) underlies
all three nodes, so the cluster's vocabulary compounds: a single tree's jagged
staircase, the forest's smoothed vote, and boosting's sharpened focus all read against
the *same* points. The curved boundary is the bridge from the classification cluster —
a straight line (even logistic regression's) cannot follow it.

This file emits the decision-tree fixture: the dataset (train + held-out test) and,
for each depth 1..8, scikit-learn's `DecisionTreeClassifier` train/test accuracy, leaf
count, and per-point train predictions — the reference the TypeScript CART must match.
Random-forest and boosting fixtures are appended here as those nodes are built.

scikit-learn / numpy only. Run: .venv/bin/python scripts/generate_trees_fixtures.py
Output is committed; regenerate only deliberately.
"""

import json
import platform
from pathlib import Path

import numpy as np
import sklearn
from sklearn.datasets import make_moons
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import log_loss as sk_log_loss
from sklearn.tree import DecisionTreeClassifier

OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "models" / "fixtures"
SEED = 7
NOISE = 0.28  # honest overlap, so depth visibly trades bias for variance
N_TRAIN = 160
N_TEST = 120
DEPTHS = list(range(1, 9))


def make_dataset() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Two interleaving moons, centred and scaled into the decision field's domain."""
    n = N_TRAIN + N_TEST
    X, y = make_moons(n_samples=n, noise=NOISE, random_state=SEED)
    # Centre and scale to a symmetric ~[-2.6, 2.6] box so the points sit nicely in the
    # DecisionField domain ([-3.6, 3.6]) with margin for the staircase to breathe.
    X = X - X.mean(axis=0)
    X = X / X.std(axis=0) * 1.35
    X = np.round(X, 3)
    rng = np.random.default_rng(SEED)
    idx = rng.permutation(n)
    tr, te = idx[:N_TRAIN], idx[N_TRAIN:]
    return X[tr], y[tr], X[te], y[te]


def points(X: np.ndarray, y: np.ndarray) -> list[dict]:
    return [{"x1": float(a), "x2": float(b), "y": int(c)} for (a, b), c in zip(X, y)]


def main() -> None:
    Xtr, ytr, Xte, yte = make_dataset()

    by_depth = []
    for d in DEPTHS:
        clf = DecisionTreeClassifier(
            criterion="gini", max_depth=d, random_state=0
        ).fit(Xtr, ytr)
        by_depth.append(
            {
                "depth": d,
                "trainAccuracy": float(clf.score(Xtr, ytr)),
                "testAccuracy": float(clf.score(Xte, yte)),
                "leaves": int(clf.get_n_leaves()),
                "actualDepth": int(clf.get_depth()),
                # per-point train predictions — the partition the TS CART must reproduce
                "trainPreds": [int(v) for v in clf.predict(Xtr)],
            }
        )

    # A fully-grown tree: the overfitting wall (boxes around individual noisy points).
    deep = DecisionTreeClassifier(criterion="gini", random_state=0).fit(Xtr, ytr)

    payload = {
        "generator": {
            "script": "scripts/generate_trees_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "sklearn": sklearn.__version__,
            "dataset": "sklearn.make_moons, centred + standardised, ×1.35",
            "criterion": "gini",
            "seed": SEED,
            "noise": NOISE,
        },
        "domain": [-3.6, 3.6],
        "train": points(Xtr, ytr),
        "test": points(Xte, yte),
        "byDepth": by_depth,
        "fullyGrown": {
            "trainAccuracy": float(deep.score(Xtr, ytr)),
            "testAccuracy": float(deep.score(Xte, yte)),
            "leaves": int(deep.get_n_leaves()),
            "actualDepth": int(deep.get_depth()),
        },
    }

    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "decision-tree.json"
    path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {path}")
    print(f"  train n={len(Xtr)}  test n={len(Xte)}")
    for r in by_depth:
        print(
            f"  depth {r['depth']}: train={r['trainAccuracy']:.3f} "
            f"test={r['testAccuracy']:.3f} leaves={r['leaves']}"
        )
    fg = payload["fullyGrown"]
    print(
        f"  fully grown: train={fg['trainAccuracy']:.3f} test={fg['testAccuracy']:.3f} "
        f"leaves={fg['leaves']} depth={fg['actualDepth']}"
    )

    write_forest(Xtr, ytr, Xte, yte)
    write_boosting(Xtr, ytr, Xte, yte)


def write_boosting(Xtr, ytr, Xte, yte) -> None:
    """Gradient-boosting reference on the SAME moons: shallow trees (depth 2) added in
    sequence. The story is the OPPOSITE of the forest — boosting cuts bias and CAN overfit:
    train log-loss falls toward zero while test accuracy peaks early and then declines.
    """
    LR, DEPTH, M = 0.3, 2, 200
    gb = GradientBoostingClassifier(
        n_estimators=M, learning_rate=LR, max_depth=DEPTH, random_state=0
    ).fit(Xtr, ytr)

    stages_tr = list(gb.staged_predict(Xtr))
    stages_te = list(gb.staged_predict(Xte))
    proba_tr = list(gb.staged_predict_proba(Xtr))
    proba_te = list(gb.staged_predict_proba(Xte))

    by_rounds = []
    for r in [1, 2, 5, 10, 20, 40, 80, 140, 200]:
        i = r - 1
        by_rounds.append(
            {
                "rounds": r,
                "trainAccuracy": float((stages_tr[i] == ytr).mean()),
                "testAccuracy": float((stages_te[i] == yte).mean()),
                "trainLogLoss": float(sk_log_loss(ytr, proba_tr[i], labels=[0, 1])),
                "testLogLoss": float(sk_log_loss(yte, proba_te[i], labels=[0, 1])),
            }
        )

    test_acc = [float((s == yte).mean()) for s in stages_te]
    peak = max(test_acc)
    peak_round = int(np.argmax(test_acc)) + 1

    payload = {
        "generator": {
            "script": "scripts/generate_trees_fixtures.py",
            "sklearn": sklearn.__version__,
            "model": "GradientBoostingClassifier(log-loss), shallow trees on the shared moons",
            "learningRate": LR,
            "maxDepth": DEPTH,
            "seed": SEED,
        },
        "byRounds": by_rounds,
        "peak": {"round": peak_round, "testAccuracy": peak},
        "final": {
            "rounds": M,
            "trainAccuracy": float((stages_tr[-1] == ytr).mean()),
            "testAccuracy": test_acc[-1],
        },
    }
    path = OUT / "gradient-boosting.json"
    path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {path}")
    for r in by_rounds:
        print(
            f"  {r['rounds']:3d} rounds: train={r['trainAccuracy']:.3f} test={r['testAccuracy']:.3f} "
            f"trainLogLoss={r['trainLogLoss']:.3f}"
        )
    print(f"  test accuracy peaks {peak:.3f} at round {peak_round}, ends {test_acc[-1]:.3f} (overfit)")


def write_forest(Xtr, ytr, Xte, yte) -> None:
    """Random-forest reference on the SAME moons data: a fully-grown single tree (the
    high-variance baseline) vs forests of growing size, each with sqrt feature sampling.
    The story is variance reduction — test accuracy rises and steadies as trees are added.
    """
    single = DecisionTreeClassifier(criterion="gini", random_state=0).fit(Xtr, ytr)

    by_trees = []
    for k in [1, 3, 10, 30, 100]:
        rf = RandomForestClassifier(
            n_estimators=k, criterion="gini", max_features="sqrt", random_state=0
        ).fit(Xtr, ytr)
        by_trees.append(
            {
                "nTrees": k,
                "trainAccuracy": float(rf.score(Xtr, ytr)),
                "testAccuracy": float(rf.score(Xte, yte)),
            }
        )

    # Variance of a single fully-grown tree across resamples vs a 100-tree forest across
    # resamples — the forest's prediction should swing far less (the whole point).
    rng = np.random.default_rng(SEED)
    single_acc, forest_acc = [], []
    n = len(Xtr)
    for _ in range(20):
        idx = rng.integers(0, n, n)  # bootstrap
        Xb, yb = Xtr[idx], ytr[idx]
        single_acc.append(
            DecisionTreeClassifier(random_state=0).fit(Xb, yb).score(Xte, yte)
        )
        forest_acc.append(
            RandomForestClassifier(
                n_estimators=100, max_features="sqrt", random_state=0
            ).fit(Xb, yb).score(Xte, yte)
        )

    payload = {
        "generator": {
            "script": "scripts/generate_trees_fixtures.py",
            "sklearn": sklearn.__version__,
            "model": "RandomForestClassifier(max_features='sqrt'), gini, on the shared moons",
            "seed": SEED,
        },
        "singleTree": {
            "trainAccuracy": float(single.score(Xtr, ytr)),
            "testAccuracy": float(single.score(Xte, yte)),
        },
        "byTrees": by_trees,
        "stability": {
            "resamples": 20,
            "singleTreeTestStd": float(np.std(single_acc)),
            "forestTestStd": float(np.std(forest_acc)),
        },
    }
    path = OUT / "random-forest.json"
    path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {path}")
    for r in by_trees:
        print(f"  {r['nTrees']:3d} trees: train={r['trainAccuracy']:.3f} test={r['testAccuracy']:.3f}")
    s = payload["stability"]
    print(
        f"  stability across 20 resamples: single-tree test std={s['singleTreeTestStd']:.3f} "
        f"vs forest std={s['forestTestStd']:.3f}"
    )


if __name__ == "__main__":
    main()
