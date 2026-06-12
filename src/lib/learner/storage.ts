import type { StateStorage } from "zustand/middleware";

/**
 * Minimal IndexedDB key-value storage for the learner model
 * (docs/00-decisions.md #003: local-first, IndexedDB, no backend).
 * Hand-rolled: ~40 lines is cheaper than a dependency (docs/06, C6).
 * Falls back to in-memory when IndexedDB is unavailable (SSR, unit tests,
 * locked-down browsers) — the lab still works, it just forgets.
 */

const DB_NAME = "ml-lab";
const STORE = "kv";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = run(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(req.result);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      }),
  );
}

const memory = new Map<string, string>();

export const learnerStorage: StateStorage = {
  async getItem(name) {
    if (typeof indexedDB === "undefined") return memory.get(name) ?? null;
    const value = await withStore("readonly", (s) => s.get(name));
    return (value as string | undefined) ?? null;
  },
  async setItem(name, value) {
    if (typeof indexedDB === "undefined") {
      memory.set(name, value);
      return;
    }
    await withStore("readwrite", (s) => s.put(value, name));
  },
  async removeItem(name) {
    if (typeof indexedDB === "undefined") {
      memory.delete(name);
      return;
    }
    await withStore("readwrite", (s) => s.delete(name));
  },
};
