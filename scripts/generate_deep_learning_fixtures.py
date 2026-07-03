"""Reference fixtures for the deep-learning cluster (CNNs first).

Hand-rolled 2D conv outputs are verified in TypeScript; this script commits the
same numbers so learners manipulate verified data.

Run: python scripts/generate_deep_learning_fixtures.py
"""

import json
import platform
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "models" / "fixtures"
SIZE = 8


def horizontal_stripes() -> np.ndarray:
    g = np.zeros((SIZE, SIZE), dtype=float)
    g[:, : SIZE // 2] = 0.15
    g[:, SIZE // 2 :] = 0.85
    return g


def vertical_stripes() -> np.ndarray:
    g = np.zeros((SIZE, SIZE), dtype=float)
    g[: SIZE // 2, :] = 0.15
    g[SIZE // 2 :, :] = 0.85
    return g


def corner_block() -> np.ndarray:
    g = np.full((SIZE, SIZE), 0.2, dtype=float)
    g[: SIZE // 2, : SIZE // 2] = 0.9
    return g


def conv_valid(image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    kh, kw = kernel.shape
    out_h = image.shape[0] - kh + 1
    out_w = image.shape[1] - kw + 1
    out = np.zeros((out_h, out_w), dtype=float)
    for r in range(out_h):
        for c in range(out_w):
            patch = image[r : r + kh, c : c + kw]
            out[r, c] = float(np.sum(patch * kernel))
    return out


def grid_to_list(g: np.ndarray) -> list[list[float]]:
    return [[float(round(v, 6)) for v in row] for row in g]


def main() -> None:
    filters = {
        "horizontal": np.array(
            [[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=float
        ),
        "vertical": np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=float),
        "blur": np.full((3, 3), 1 / 9, dtype=float),
    }
    images = {
        "horizontal-stripes": horizontal_stripes(),
        "vertical-stripes": vertical_stripes(),
        "corner-block": corner_block(),
    }

    outputs: dict = {}
    for image_id, image in images.items():
        outputs[image_id] = {}
        for filter_id, kernel in filters.items():
            out = conv_valid(image, kernel)
            outputs[image_id][filter_id] = grid_to_list(out)

    # Translation demo: shift horizontal stripes one pixel right (zero-pad left).
    base = horizontal_stripes()
    shifted = np.zeros_like(base)
    shifted[:, 1:] = base[:, :-1]
    shift_demo = {
        "original": grid_to_list(base),
        "shifted": grid_to_list(shifted),
        "filter": grid_to_list(filters["vertical"]),
        "originalOutput": grid_to_list(conv_valid(base, filters["vertical"])),
        "shiftedOutput": grid_to_list(conv_valid(shifted, filters["vertical"])),
    }

    fc_params = SIZE * SIZE * (SIZE - 2) * (SIZE - 2) + (SIZE - 2) * (SIZE - 2)
    conv_params = 3 * 3 + 1

    payload = {
        "generator": {
            "script": "scripts/generate_deep_learning_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "gridSize": SIZE,
            "kernelSize": 3,
        },
        "size": SIZE,
        "kernelSize": 3,
        "outputSize": SIZE - 2,
        "images": {k: grid_to_list(v) for k, v in images.items()},
        "filters": {k: grid_to_list(v) for k, v in filters.items()},
        "outputs": outputs,
        "shiftDemo": shift_demo,
        "paramCounts": {
            "fullyConnected": fc_params,
            "convolution": conv_params,
        },
    }

    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "cnns.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path}")


def _top_cosine_ids(tokens: list[dict], anchor_id: str, k: int) -> list[str]:
    anchor = next(t for t in tokens if t["id"] == anchor_id)
    av = np.array(anchor["vector"], dtype=float)
    scored: list[tuple[float, str]] = []
    for token in tokens:
        if token["id"] == anchor_id:
            continue
        tv = np.array(token["vector"], dtype=float)
        cos = float(np.dot(av, tv) / (np.linalg.norm(av) * np.linalg.norm(tv)))
        scored.append((cos, token["id"]))
    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [token_id for _, token_id in scored[:k]]


def embeddings_fixture() -> None:
    """Hand-crafted 2-D word vectors + co-occurrence features for a PCA contrast."""
    from sklearn.decomposition import PCA

    tokens = [
        {"id": "king", "label": "king", "group": "royalty", "vector": [2.1, 0.8]},
        {"id": "queen", "label": "queen", "group": "royalty", "vector": [2.0, 1.6]},
        {"id": "prince", "label": "prince", "group": "royalty", "vector": [1.2, 0.0]},
        {"id": "man", "label": "man", "group": "gender", "vector": [0.5, -0.2]},
        {"id": "woman", "label": "woman", "group": "gender", "vector": [0.4, 0.6]},
        {"id": "cat", "label": "cat", "group": "animal", "vector": [-1.2, 0.5]},
        {"id": "dog", "label": "dog", "group": "animal", "vector": [-1.0, -0.3]},
        {"id": "kitten", "label": "kitten", "group": "animal", "vector": [-1.4, 0.9]},
        {"id": "run", "label": "run", "group": "motion", "vector": [-0.2, -1.4]},
        {"id": "walk", "label": "walk", "group": "motion", "vector": [0.1, -1.1]},
        {"id": "sprint", "label": "sprint", "group": "motion", "vector": [-0.4, -1.8]},
        {"id": "hot", "label": "hot", "group": "temperature", "vector": [0.4, -0.6]},
        {"id": "cold", "label": "cold", "group": "temperature", "vector": [-0.5, -0.8]},
    ]

    # Co-occurrence-style features (fixed, not task-tuned): royal, human, female,
    # animal, motion, intensity — PCA on these will not preserve the gender axis.
    feature_names = ["royal", "human", "female", "animal", "motion", "intensity"]
    features = {
        "king": [1, 1, 0, 0, 0, 0.2],
        "queen": [1, 1, 1, 0, 0, 0.2],
        "prince": [1, 1, 0, 0, 0, 0.1],
        "man": [0, 1, 0, 0, 0, 0.0],
        "woman": [0, 1, 1, 0, 0, 0.0],
        "cat": [0, 0, 0, 1, 0, 0.1],
        "dog": [0, 0, 0, 1, 0, 0.0],
        "kitten": [0, 0, 0, 1, 0, 0.2],
        "run": [0, 0, 0, 0, 1, 0.8],
        "walk": [0, 0, 0, 0, 1, 0.3],
        "sprint": [0, 0, 0, 0, 1, 1.0],
        "hot": [0, 0, 0, 0, 0, 0.9],
        "cold": [0, 0, 0, 0, 0, 0.1],
    }

    matrix = np.array([features[t["id"]] for t in tokens], dtype=float)
    pca = PCA(n_components=2, random_state=7).fit(matrix)
    pca_points = pca.transform(matrix)

    king = next(t for t in tokens if t["id"] == "king")
    man = next(t for t in tokens if t["id"] == "man")
    woman = next(t for t in tokens if t["id"] == "woman")
    queen = next(t for t in tokens if t["id"] == "queen")
    kv = np.array(king["vector"])
    mv = np.array(man["vector"])
    wv = np.array(woman["vector"])
    qv = np.array(queen["vector"])
    analogy = kv - mv + wv

    payload = {
        "generator": {
            "script": "scripts/generate_deep_learning_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "note": "learned vectors hand-placed; PCA on co-occurrence features",
        },
        "featureNames": feature_names,
        "tokens": [
            {
                **token,
                "vector": [float(v) for v in token["vector"]],
                "features": features[token["id"]],
                "pca": [float(pca_points[i, 0]), float(pca_points[i, 1])],
            }
            for i, token in enumerate(tokens)
        ],
        "analogy": {
            "a": "king",
            "b": "man",
            "c": "woman",
            "target": "queen",
            "result": [float(analogy[0]), float(analogy[1])],
            "distanceToQueen": float(np.linalg.norm(analogy - qv)),
        },
        "domain": {
            "learned": [
                float(min(v for t in tokens for v in t["vector"])),
                float(max(v for t in tokens for v in t["vector"])),
            ],
            "pca": [
                float(pca_points[:, 0].min() - 0.3),
                float(pca_points[:, 0].max() + 0.3),
            ],
            "pcaY": [
                float(pca_points[:, 1].min() - 0.3),
                float(pca_points[:, 1].max() + 0.3),
            ],
        },
        "nearestKing": {
            "anchor": "king",
            "topIds": _top_cosine_ids(tokens, "king", 3),
            "queenCosine": float(
                np.dot(kv, qv) / (np.linalg.norm(kv) * np.linalg.norm(qv))
            ),
        },
    }

    path = OUT / "embeddings.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path}")


def _softmax_rows(logits: np.ndarray) -> np.ndarray:
    shifted = logits - logits.max(axis=1, keepdims=True)
    exp = np.exp(shifted)
    return exp / exp.sum(axis=1, keepdims=True)


def attention_fixture() -> None:
    """Committed self-attention logits for a six-token sentence — two interpretable heads."""
    tokens = [
        {"id": "the-0", "label": "The", "role": "article"},
        {"id": "cat", "label": "cat", "role": "noun"},
        {"id": "sat", "label": "sat", "role": "verb"},
        {"id": "on", "label": "on", "role": "prep"},
        {"id": "the-1", "label": "the", "role": "article"},
        {"id": "mat", "label": "mat", "role": "noun"},
    ]
    n = len(tokens)
    d_k = 4

    # Head 0 — syntax: verbs look back to subjects, prepositions to objects.
    logits_syntax = np.array(
        [
            [-1.0, 0.5, 0.0, -1.0, -1.0, -1.0],
            [-1.0, -1.0, 2.8, 0.0, -1.0, 0.8],
            [-1.5, 3.8, -1.0, -1.0, -1.5, 1.2],
            [-1.5, -1.0, -0.5, -1.0, -1.0, 3.6],
            [-1.5, -0.5, -0.5, -0.5, -1.5, 2.8],
            [-1.0, 0.5, -0.5, 2.6, -1.0, -1.0],
        ],
        dtype=float,
    )

    # Head 1 — locality: each token mostly listens to itself and immediate neighbours.
    logits_local = np.zeros((n, n), dtype=float)
    for i in range(n):
        for j in range(n):
            logits_local[i, j] = -2.5 * abs(i - j)

    # Simple value vectors (3-D) so weighted mixes stay legible in the UI.
    values = np.array(
        [
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0],
            [0.7, 0.0, 0.3],
            [1.0, 0.0, 0.0],
            [0.0, 0.8, 0.2],
        ],
        dtype=float,
    )

    heads = []
    for head_id, label, logits in [
        ("syntax", "Syntax", logits_syntax),
        ("local", "Local", logits_local),
    ]:
        weights = _softmax_rows(logits / np.sqrt(d_k))
        outputs = weights @ values
        heads.append(
            {
                "id": head_id,
                "label": label,
                "dK": d_k,
                "logits": logits.round(6).tolist(),
                "weights": weights.round(6).tolist(),
                "values": values.round(6).tolist(),
                "outputs": outputs.round(6).tolist(),
            }
        )

    sat_row = 2
    cat_col = 1
    on_row = 3
    mat_col = 5
    syntax_weights = np.array(heads[0]["weights"])
    pinned = {
        "satToCat": {
            "headId": "syntax",
            "queryIndex": sat_row,
            "keyIndex": cat_col,
            "weight": float(syntax_weights[sat_row, cat_col]),
        },
        "onToMat": {
            "headId": "syntax",
            "queryIndex": on_row,
            "keyIndex": mat_col,
            "weight": float(syntax_weights[on_row, mat_col]),
        },
    }

    payload = {
        "generator": {
            "script": "scripts/generate_deep_learning_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "note": "hand-tuned logits; softmax in TypeScript must match _softmax_rows",
        },
        "sentence": "The cat sat on the mat",
        "tokens": tokens,
        "valueDim": int(values.shape[1]),
        "heads": heads,
        "pinned": pinned,
    }

    path = OUT / "attention.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path}")


def transformer_fixture() -> None:
    """Next-token prediction on a short prefix — one block, residuals, LM head."""
    context = [
        {"id": "the-0", "label": "The"},
        {"id": "cat", "label": "cat"},
        {"id": "sat", "label": "sat"},
        {"id": "on", "label": "on"},
        {"id": "the-1", "label": "the"},
    ]
    candidates = [
        {"id": "mat", "label": "mat"},
        {"id": "rug", "label": "rug"},
        {"id": "floor", "label": "floor"},
        {"id": "sat", "label": "sat"},
        {"id": "cat", "label": "cat"},
        {"id": "the", "label": "the"},
    ]
    base_logits = np.array([2.85, 0.55, 0.15, -0.55, -1.05, -0.85], dtype=float)
    block_boost = np.array([0.35, 0.05, 0.02, 0.0, 0.0, 0.0], dtype=float)
    no_residual_logits = base_logits - np.array([1.35, 0.15, 0.05, 0.0, 0.0, 0.0], dtype=float)

    def prob(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
        scaled = logits / temperature
        shifted = scaled - scaled.max()
        exp = np.exp(shifted)
        return exp / exp.sum()

    pinned_prob = float(prob(base_logits)[0])

    # Last context token ("the") attending backward before the LM head.
    attn_logits = np.array([-1.5, 0.4, 1.0, 2.8, 0.2], dtype=float)
    attn_weights = _softmax_rows((attn_logits / np.sqrt(4))[np.newaxis, :])[0]

    stages = [
        {"id": "embed", "label": "Token embed", "norm": 1.0},
        {"id": "attn", "label": "Self-attention", "deltaNorm": 0.34},
        {"id": "attn-residual", "label": "Add & norm", "norm": 1.14},
        {"id": "ffn", "label": "Feed-forward", "deltaNorm": 0.41},
        {"id": "ffn-residual", "label": "Add & norm", "norm": 1.31},
        {"id": "head", "label": "LM head", "norm": 1.31},
    ]

    payload = {
        "generator": {
            "script": "scripts/generate_deep_learning_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "note": "hand-tuned next-token logits; softmax in TypeScript must match prob()",
        },
        "prefix": "The cat sat on the",
        "context": context,
        "predictIndex": len(context) - 1,
        "candidates": candidates,
        "nextToken": {
            "targetId": "mat",
            "baseLogits": base_logits.round(6).tolist(),
            "blockBoost": block_boost.round(6).tolist(),
            "noResidualLogits": no_residual_logits.round(6).tolist(),
            "pinnedProb": pinned_prob,
        },
        "block": {
            "residualShare": 0.74,
            "stages": stages,
        },
        "attentionRow": {
            "queryIndex": len(context) - 1,
            "logits": attn_logits.round(6).tolist(),
            "weights": attn_weights.round(6).tolist(),
            "topKeyIndex": int(np.argmax(attn_weights)),
        },
    }

    path = OUT / "transformer.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path}")


def adaptation_fixture() -> None:
    """Committed adaptation tradeoffs for a support-bot scenario — three steering strategies."""
    scenarios = [
        {
            "id": "reset-procedure",
            "title": "Hardware reset",
            "userQuery": "How do I factory-reset the OrbitDesk Pro docking station?",
            "goldAnswer": "Hold the rear pinhole reset for 8 seconds until the LED blinks amber.",
        },
        {
            "id": "pricing-update",
            "title": "Pricing after update",
            "userQuery": "What is the monthly price for OrbitDesk Teams after the July update?",
            "goldAnswer": "OrbitDesk Teams is $18 per seat per month after the July 2026 update.",
        },
    ]

    def metrics(domain: float, fresh: float, cost: float, latency: float, cites: bool):
        return {
            "domainFit": domain,
            "freshness": fresh,
            "cost": cost,
            "latency": latency,
            "citesSource": cites,
        }

    strategies = [
        {
            "id": "fine-tuning",
            "label": "Fine-tuning",
            "lever": "Update weights on domain transcripts",
            "pipeline": ["Pretrained base", "Domain fine-tune", "Frozen weights at deploy"],
        },
        {
            "id": "prompting",
            "label": "Prompting",
            "lever": "Instructions + examples in context",
            "pipeline": ["Pretrained base", "System prompt", "User message"],
        },
        {
            "id": "rag",
            "label": "RAG",
            "lever": "Retrieve docs, then generate",
            "pipeline": ["Pretrained base", "Retrieve chunks", "Prompt with evidence"],
        },
    ]

    # scenarioId -> strategyId -> metrics (docs current)
    table = {
        "reset-procedure": {
            "fine-tuning": metrics(0.92, 0.38, 0.82, 0.55, False),
            "prompting": metrics(0.61, 0.52, 0.18, 0.22, False),
            "rag": metrics(0.89, 0.94, 0.42, 0.48, True),
        },
        "pricing-update": {
            "fine-tuning": metrics(0.88, 0.35, 0.82, 0.55, False),
            "prompting": metrics(0.54, 0.50, 0.18, 0.22, False),
            "rag": metrics(0.91, 0.96, 0.42, 0.48, True),
        },
    }

    stale_finetune = {
        "reset-procedure": metrics(0.44, 0.12, 0.82, 0.55, False),
        "pricing-update": metrics(0.39, 0.10, 0.82, 0.55, False),
    }
    bad_retrieval = {
        "reset-procedure": metrics(0.36, 0.94, 0.42, 0.48, True),
        "pricing-update": metrics(0.33, 0.96, 0.42, 0.48, True),
    }

    payload = {
        "generator": {
            "script": "scripts/generate_deep_learning_fixtures.py",
            "python": platform.python_version(),
            "numpy": np.__version__,
            "note": "conceptual metrics for teaching tradeoffs — not live model scores",
        },
        "product": "OrbitDesk support bot",
        "scenarios": scenarios,
        "strategies": strategies,
        "metrics": table,
        "breakIt": {
            "staleFineTune": stale_finetune,
            "badRetrieval": bad_retrieval,
        },
        "pinned": {
            "bestForFreshDocs": "rag",
            "bestDomainFitFreshFineTune": "fine-tuning",
            "resetProcedureRagDomain": table["reset-procedure"]["rag"]["domainFit"],
        },
    }

    path = OUT / "adaptation.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path}")


if __name__ == "__main__":
    main()
    embeddings_fixture()
    attention_fixture()
    transformer_fixture()
    adaptation_fixture()
