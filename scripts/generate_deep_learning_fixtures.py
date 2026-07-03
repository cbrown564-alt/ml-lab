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


if __name__ == "__main__":
    main()
