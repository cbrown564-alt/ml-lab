import type { Vec2 } from "@/lib/models/gradient";

/**
 * The-gradient experiment framing. The landscape is fixed (a couple of Gaussian
 * hills); the learner drags a point and watches the gradient arrow. The default point
 * sits on a slope so the arrow is immediately meaningful.
 */
export const defaultPoint: Vec2 = { x: -0.2, y: 1.3 };

export const gradientScenario = {
  id: "the-arrow",
  title: "The arrow that points uphill",
  prompt:
    "This shaded landscape is a function of two variables — bright peaks, dark valleys. Drag the point anywhere and watch the gradient arrow: it always points straight uphill, in the direction the surface climbs fastest, and it crosses the shading bands at right angles. The steeper the slope, the longer the arrow. Flip to descent and it reverses — that reversed arrow is the step gradient descent takes.",
};
