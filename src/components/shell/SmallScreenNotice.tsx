/**
 * The vision's promise for small viewports (docs/01-vision.md): a graceful
 * "best experienced on a larger screen" treatment, not a cramped port and
 * not a wall. Reading stays fully available; the notice just sets honest
 * expectations about the experiments. CSS-only — costs no client JS.
 */
export function SmallScreenNotice() {
  return (
    <aside className="border-b border-line bg-raised px-5 py-3 text-sm leading-relaxed text-ink-muted md:hidden">
      ML Lab is built for a big screen — the experiments want room to move.
      Everything here is readable on your phone; for the hands-on exhibits,
      come back on a laptop.
    </aside>
  );
}
