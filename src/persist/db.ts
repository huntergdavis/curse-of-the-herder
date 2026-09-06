import { assertWorld, type WorldState } from "../core/sim/state";

const DB_NAME = "curse-of-the-herder";
const DB_VERSION = 1;
const ACTIVE_KEY = "curse-of-the-herder:active";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("herders")) db.createObjectStore("herders", { keyPath: "id" });
      if (!db.objectStoreNames.contains("hall")) db.createObjectStore("hall", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export interface HerderSummary {
  id: string;
  name: string;
  penned: number;
  total: number;
  tick: number;
  finished: boolean;
}

export const repository = {
  async save(world: WorldState): Promise<void> {
    // Structured clone handles typed arrays, but the world has none; paths are plain.
    await tx("herders", "readwrite", (s) => s.put(world));
    try {
      sessionStorage.setItem("curse-of-the-herder:mirror", JSON.stringify(world));
    } catch {
      /* storage may be unavailable */
    }
  },
  async load(id: string): Promise<WorldState | null> {
    const w = await tx<unknown>("herders", "readonly", (s) => s.get(id));
    if (!w) return null;
    assertWorld(w);
    return w;
  },
  async list(): Promise<HerderSummary[]> {
    const all = await tx<unknown[]>("herders", "readonly", (s) => s.getAll());
    const out: HerderSummary[] = [];
    for (const w of all) {
      try {
        assertWorld(w);
        out.push({ id: w.id, name: w.name, penned: w.sheepPenned, total: w.sheep.length, tick: w.tick, finished: w.finished });
      } catch {
        /* skip corrupt */
      }
    }
    return out.sort((a, b) => b.tick - a.tick);
  },
  async remove(id: string): Promise<void> {
    await tx("herders", "readwrite", (s) => s.delete(id));
  },
  getActiveId(): string | null {
    try {
      return localStorage.getItem(ACTIVE_KEY);
    } catch {
      return null;
    }
  },
  setActiveId(id: string): void {
    try {
      localStorage.setItem(ACTIVE_KEY, id);
    } catch {
      /* ignore */
    }
  },
};
