/**
 * Exhibit glyphs — the signature visual identity of each exhibit, distilled to
 * one luminous mark in the lab's own viz grammar (homepages/SYNTHESIS.md: "make
 * each chapter a jewel", after Seeing Theory's chapter circles). Each glyph is a
 * tiny, recognisable version of the concept's hero idea, drawn to glow on the
 * deep gem-plate the JewelGallery sets behind it. One shared palette across all
 * fifteen so the wall reads as variety *within a grammar*, not fifteen unrelated
 * illustrations — the system is the moat (docs/01-vision.md).
 *
 * Crisp line-art only (no per-glyph blur filters): fifteen of these share a page
 * and must stay within the performance budget. Life comes from the gallery on
 * hover, not from fifteen things animating at rest.
 */

// Brightened siblings of the --viz-* hues, tuned to glow on the dark gem-plate.
const C = {
  data: "oklch(82% 0.15 82)", // truth / observations (gold)
  model: "oklch(72% 0.15 250)", // prediction / fit (blue)
  accent: "oklch(74% 0.12 190)", // the lab's teal — emphasis, the chosen path
  error: "oklch(70% 0.19 18)", // residual / failure (red)
  param: "oklch(72% 0.16 305)", // a knob / second class (violet)
  faint: "oklch(62% 0.02 260)", // structure, axes, grid
} as const;

const VB = "0 0 120 96";

/** Each glyph is the inner content of a shared 120×96 viewBox. */
const GLYPHS: Record<string, React.ReactNode> = {
  // Learning from data: a scatter resolves into an emergent rule.
  "what-is-ml": (
    <>
      {[
        [26, 62],
        [40, 70],
        [54, 50],
        [70, 54],
        [86, 36],
        [98, 40],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.2" fill={C.data} />
      ))}
      <path
        d="M22 72 C 45 64, 60 46, 100 34"
        fill="none"
        stroke={C.accent}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M94 30 L104 33 L97 41" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  // The dataset: a matrix of rows; the target column stands apart.
  "the-dataset": (
    <>
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2].map((c) => (
          <circle key={`${r}-${c}`} cx={32 + c * 18} cy={30 + r * 13} r="3" fill={C.data} fillOpacity={0.92} />
        )),
      )}
      <rect x="78" y="22" width="14" height="56" rx="7" fill="none" stroke={C.error} strokeWidth="2.5" />
      {[0, 1, 2, 3].map((r) => (
        <circle key={r} cx="85" cy={30 + r * 13} r="3" fill={C.error} />
      ))}
    </>
  ),

  // Regression task: predict a number — a rising trend reads off the axis.
  "regression-task": (
    <>
      <line x1="24" y1="20" x2="24" y2="78" stroke={C.faint} strokeWidth="2" />
      <line x1="24" y1="78" x2="100" y2="78" stroke={C.faint} strokeWidth="2" />
      {[
        [36, 66],
        [50, 58],
        [64, 52],
        [78, 40],
        [90, 34],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.2" fill={C.data} />
      ))}
      <path d="M32 68 L96 32" stroke={C.model} strokeWidth="3" strokeLinecap="round" />
      <line x1="20" y1="34" x2="28" y2="34" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
    </>
  ),

  // Linear regression: the signature — scatter, fit line, one residual square.
  "linear-regression": (
    <>
      <line x1="22" y1="72" x2="100" y2="30" stroke={C.model} strokeWidth="3" strokeLinecap="round" />
      <rect x="60" y="34" width="20" height="20" fill={C.error} fillOpacity="0.18" stroke={C.error} strokeWidth="2" />
      <line x1="80" y1="34" x2="80" y2="54" stroke={C.error} strokeWidth="2" strokeDasharray="3 3" />
      {[
        [30, 70],
        [44, 60],
        [58, 56],
        [80, 34],
        [92, 36],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.4" fill={C.data} />
      ))}
    </>
  ),

  // Loss functions: a convex bowl, a point, the loss it pays.
  "loss-functions": (
    <>
      <path d="M26 26 C 44 92, 76 92, 94 26" fill="none" stroke={C.model} strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="54" x2="70" y2="74" stroke={C.error} strokeWidth="2.5" strokeDasharray="3 3" />
      <circle cx="70" cy="54" r="4.5" fill={C.data} />
      <circle cx="60" cy="78" r="3" fill={C.accent} />
    </>
  ),

  // Gradient descent: a ball steps downhill to the minimum.
  "gradient-descent": (
    <>
      <path d="M22 26 C 42 96, 78 96, 98 26" fill="none" stroke={C.faint} strokeWidth="2.5" strokeLinecap="round" />
      {[
        [34, 50],
        [46, 68],
        [56, 79],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={C.accent} fillOpacity={0.5 + i * 0.18} />
      ))}
      <circle cx="60" cy="83" r="5" fill={C.data} />
      <path d="M60 83 L72 76" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),

  // Train/test: data you fit (filled) vs data you're judged on (hollow).
  "train-test-generalization": (
    <>
      <line x1="60" y1="20" x2="60" y2="78" stroke={C.faint} strokeWidth="2" strokeDasharray="4 4" />
      <line x1="20" y1="70" x2="100" y2="34" stroke={C.model} strokeWidth="2.5" strokeLinecap="round" />
      {[
        [30, 66],
        [40, 54],
        [50, 58],
      ].map(([x, y], i) => (
        <circle key={`a${i}`} cx={x} cy={y} r="3.2" fill={C.data} />
      ))}
      {[
        [72, 48],
        [84, 40],
        [92, 44],
      ].map(([x, y], i) => (
        <circle key={`b${i}`} cx={x} cy={y} r="3.2" fill="none" stroke={C.accent} strokeWidth="2.2" />
      ))}
    </>
  ),

  // Overfitting: a wild curve chases noise; the smooth one generalises.
  "overfitting-regularization": (
    <>
      <path d="M22 58 C 34 30, 40 84, 52 44 S 70 82, 80 40 96 50, 100 44" fill="none" stroke={C.error} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 64 C 44 44, 78 40, 100 34" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
      {[
        [30, 58],
        [48, 50],
        [66, 46],
        [84, 40],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={C.data} />
      ))}
    </>
  ),

  // Logistic regression: the sigmoid crosses a threshold between two classes.
  "logistic-regression": (
    <>
      <line x1="22" y1="50" x2="100" y2="50" stroke={C.faint} strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M24 74 C 52 74, 58 26, 96 26" fill="none" stroke={C.model} strokeWidth="3" strokeLinecap="round" />
      {[
        [32, 74],
        [44, 72],
      ].map(([x, y], i) => (
        <circle key={`l${i}`} cx={x} cy={y} r="3.2" fill={C.data} />
      ))}
      {[
        [78, 28],
        [90, 26],
      ].map(([x, y], i) => (
        <circle key={`h${i}`} cx={x} cy={y} r="3.2" fill={C.param} />
      ))}
    </>
  ),

  // Classification: a boundary parts two clouds.
  "classification-task": (
    <>
      <path d="M34 22 C 58 44, 62 56, 88 78" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
      {[
        [34, 56],
        [44, 66],
        [30, 70],
        [48, 50],
      ].map(([x, y], i) => (
        <circle key={`g${i}`} cx={x} cy={y} r="3.2" fill={C.data} />
      ))}
      {[
        [76, 34],
        [86, 44],
        [70, 30],
        [88, 30],
      ].map(([x, y], i) => (
        <circle key={`p${i}`} cx={x} cy={y} r="3.2" fill={C.param} />
      ))}
    </>
  ),

  // Neural network: input (2) → hidden (3) → output (1), every edge landing on
  // a real node and the hidden layer converging on the single final unit.
  "neural-network-fundamentals": (
    <>
      {/* input → hidden */}
      {[32, 64].map((y1, i) =>
        [28, 48, 68].map((y2, j) => (
          <line
            key={`ih-${i}-${j}`}
            x1="30"
            y1={y1}
            x2="58"
            y2={y2}
            stroke={C.faint}
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
        )),
      )}
      {/* hidden → output: all three converge on the final node */}
      {[28, 48, 68].map((y1, j) => (
        <line
          key={`ho-${j}`}
          x1="58"
          y1={y1}
          x2="86"
          y2="48"
          stroke={C.faint}
          strokeWidth="1.2"
          strokeOpacity="0.7"
        />
      ))}
      {[32, 64].map((y, i) => (
        <circle key={`i${i}`} cx="30" cy={y} r="4" fill={C.data} />
      ))}
      {[28, 48, 68].map((y, i) => (
        <circle key={`hd${i}`} cx="58" cy={y} r="4" fill={C.model} />
      ))}
      <circle cx="86" cy="48" r="4.5" fill={C.accent} />
    </>
  ),

  // Feature scaling: a stretched cloud normalised to a round one.
  "feature-scaling": (
    <>
      <ellipse cx="42" cy="50" rx="20" ry="8" transform="rotate(-32 42 50)" fill="none" stroke={C.error} strokeWidth="2.2" />
      <circle cx="84" cy="50" r="13" fill="none" stroke={C.accent} strokeWidth="2.6" />
      <path d="M62 50 L72 50" stroke={C.faint} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M68 46 L73 50 L68 54" fill="none" stroke={C.faint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="84" cy="50" r="2.6" fill={C.data} />
    </>
  ),

  // Bias & variance: the U-shaped total error between two trends.
  "bias-variance": (
    <>
      <line x1="22" y1="78" x2="100" y2="78" stroke={C.faint} strokeWidth="2" />
      <path d="M26 30 C 44 64, 50 64, 60 56" fill="none" stroke={C.model} strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.8" />
      <path d="M60 56 C 72 48, 80 36, 96 30" fill="none" stroke={C.param} strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.8" />
      <path d="M26 42 C 48 78, 72 78, 96 42" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
      <circle cx="61" cy="68" r="4" fill={C.data} />
    </>
  ),

  // Data leakage: the answer sneaks into the features.
  "data-leakage": (
    <>
      <rect x="26" y="28" width="34" height="44" rx="5" fill="none" stroke={C.data} strokeWidth="2.4" />
      {[40, 54].map((y, i) => (
        <line key={i} x1="33" y1={y} x2="53" y2={y} stroke={C.data} strokeWidth="2" strokeOpacity="0.7" />
      ))}
      <rect x="80" y="28" width="14" height="44" rx="5" fill="none" stroke={C.error} strokeWidth="2.4" />
      <path d="M80 50 C 70 50, 70 50, 62 50" fill="none" stroke={C.error} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="4 4" />
      <path d="M66 46 L60 50 L66 54" fill="none" stroke={C.error} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  // The gradient: the arrow of steepest ascent across contours.
  "the-gradient": (
    <>
      {[26, 18, 10].map((r, i) => (
        <ellipse key={i} cx="54" cy="56" rx={r + 10} ry={r} transform="rotate(-24 54 56)" fill="none" stroke={C.model} strokeWidth="2" strokeOpacity={0.5 + i * 0.16} />
      ))}
      <path d="M50 70 L74 34" stroke={C.accent} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M66 34 L76 32 L72 42" fill="none" stroke={C.accent} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function ExhibitGlyph({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox={VB} className={className} aria-hidden role="img">
      {GLYPHS[id] ?? (
        <circle cx="60" cy="48" r="20" fill="none" stroke={C.faint} strokeWidth="2.5" />
      )}
    </svg>
  );
}
