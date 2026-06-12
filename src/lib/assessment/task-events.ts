/**
 * Task events — the thin wire between an experiment island and its
 * experiment-task assessment items (docs/06, B5). The lab reports that a
 * condition was met ("gradient-descent:diverged"); whichever task item is
 * listening marks itself complete. Deliberately a plain event bus: the two
 * sides stay decoupled and the lib layer stays React-free.
 */

type Listener = (event: string) => void;

const listeners = new Set<Listener>();

export function reportTaskEvent(event: string): void {
  for (const l of listeners) l(event);
}

export function onTaskEvent(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
