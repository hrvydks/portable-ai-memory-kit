import { Canon, CurrentState, Delta, MemoryData, defaultCanon, defaultCurrent } from "@/lib/types";

const DB_NAME = "portable-ai-memory-kit";
const DB_VERSION = 1;
const STORE_CANON = "canon";
const STORE_CURRENT = "current";
const STORE_DELTAS = "deltas";
const STORE_META = "meta";

const LS_CANON = "pamk-canon";
const LS_CURRENT = "pamk-current";
const LS_DELTAS = "pamk-deltas";
const LS_META = "pamk-meta";

const META_ONBOARDING = "onboardingSeen";

const isBrowser = typeof window !== "undefined";

function openDatabase(): Promise<IDBDatabase | null> {
  if (!isBrowser || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_CANON)) {
        db.createObjectStore(STORE_CANON, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_CURRENT)) {
        db.createObjectStore(STORE_CURRENT, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_DELTAS)) {
        db.createObjectStore(STORE_DELTAS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T>
): Promise<T | null> {
  const db = await openDatabase();
  if (!db) {
    return null;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    callback(store)
      .then((value) => {
        tx.oncomplete = () => resolve(value);
      })
      .catch((error) => reject(error));
  });
}

function loadLocalStorage<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveLocalStorage<T>(key: string, value: T) {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export async function getCanon(): Promise<Canon> {
  const result = await withStore(STORE_CANON, "readonly", async (store) => {
    const request = store.get("canon");
    return new Promise<Canon>((resolve) => {
      request.onsuccess = () => resolve((request.result as Canon) ?? defaultCanon);
      request.onerror = () => resolve(defaultCanon);
    });
  });
  if (result) return result;
  return loadLocalStorage(LS_CANON, defaultCanon);
}

export async function saveCanon(canon: Canon) {
  const updated = { ...canon, updatedAt: Date.now() };
  const stored = await withStore(STORE_CANON, "readwrite", async (store) => {
    store.put(updated);
    return updated;
  });
  if (!stored) {
    saveLocalStorage(LS_CANON, updated);
  }
  return updated;
}

export async function getCurrent(): Promise<CurrentState> {
  const result = await withStore(STORE_CURRENT, "readonly", async (store) => {
    const request = store.get("current");
    return new Promise<CurrentState>((resolve) => {
      request.onsuccess = () => resolve((request.result as CurrentState) ?? defaultCurrent);
      request.onerror = () => resolve(defaultCurrent);
    });
  });
  if (result) return result;
  return loadLocalStorage(LS_CURRENT, defaultCurrent);
}

export async function saveCurrent(current: CurrentState) {
  const updated = { ...current, updatedAt: Date.now() };
  const stored = await withStore(STORE_CURRENT, "readwrite", async (store) => {
    store.put(updated);
    return updated;
  });
  if (!stored) {
    saveLocalStorage(LS_CURRENT, updated);
  }
  return updated;
}

export async function listDeltas(): Promise<Delta[]> {
  const result = await withStore(STORE_DELTAS, "readonly", async (store) => {
    const request = store.getAll();
    return new Promise<Delta[]>((resolve) => {
      request.onsuccess = () => resolve((request.result as Delta[]) ?? []);
      request.onerror = () => resolve([]);
    });
  });
  if (result) return result;
  return loadLocalStorage(LS_DELTAS, [] as Delta[]);
}

export async function saveDelta(delta: Delta) {
  const stored = await withStore(STORE_DELTAS, "readwrite", async (store) => {
    store.put(delta);
    return delta;
  });
  if (!stored) {
    const existing = loadLocalStorage(LS_DELTAS, [] as Delta[]);
    const updated = existing.filter((item) => item.id !== delta.id).concat(delta);
    saveLocalStorage(LS_DELTAS, updated);
  }
  return delta;
}

export async function deleteDelta(deltaId: string) {
  const stored = await withStore(STORE_DELTAS, "readwrite", async (store) => {
    store.delete(deltaId);
    return true;
  });
  if (!stored) {
    const existing = loadLocalStorage(LS_DELTAS, [] as Delta[]);
    saveLocalStorage(
      LS_DELTAS,
      existing.filter((item) => item.id !== deltaId)
    );
  }
}

export async function replaceAll(data: MemoryData) {
  await withStore(STORE_CANON, "readwrite", async (store) => {
    store.put(data.canon);
    return true;
  });
  await withStore(STORE_CURRENT, "readwrite", async (store) => {
    store.put(data.current);
    return true;
  });
  await withStore(STORE_DELTAS, "readwrite", async (store) => {
    store.clear();
    data.deltas.forEach((delta) => store.put(delta));
    return true;
  });

  saveLocalStorage(LS_CANON, data.canon);
  saveLocalStorage(LS_CURRENT, data.current);
  saveLocalStorage(LS_DELTAS, data.deltas);
}

export async function mergeAll(data: MemoryData) {
  const [canon, current, deltas] = await Promise.all([getCanon(), getCurrent(), listDeltas()]);
  const merged: MemoryData = {
    canon: { ...canon, ...data.canon, updatedAt: Date.now() },
    current: { ...current, ...data.current, updatedAt: Date.now() },
    deltas: [...deltas, ...data.deltas.filter((delta) => !deltas.some((d) => d.id === delta.id))]
  };
  await replaceAll(merged);
}

export async function exportAll(): Promise<MemoryData> {
  const [canon, current, deltas] = await Promise.all([getCanon(), getCurrent(), listDeltas()]);
  return { canon, current, deltas };
}

export async function setOnboardingSeen(value: boolean) {
  const stored = await withStore(STORE_META, "readwrite", async (store) => {
    store.put({ key: META_ONBOARDING, value });
    return true;
  });
  if (!stored) {
    saveLocalStorage(LS_META, { [META_ONBOARDING]: value });
  }
}

export async function getOnboardingSeen(): Promise<boolean> {
  const stored = await withStore(STORE_META, "readonly", async (store) => {
    const request = store.get(META_ONBOARDING);
    return new Promise<boolean>((resolve) => {
      request.onsuccess = () => resolve(Boolean(request.result?.value));
      request.onerror = () => resolve(false);
    });
  });
  if (stored !== null) return stored;
  const meta = loadLocalStorage(LS_META, { [META_ONBOARDING]: false } as Record<string, boolean>);
  return Boolean(meta[META_ONBOARDING]);
}

export async function resetAll() {
  await withStore(STORE_CANON, "readwrite", async (store) => {
    store.clear();
    return true;
  });
  await withStore(STORE_CURRENT, "readwrite", async (store) => {
    store.clear();
    return true;
  });
  await withStore(STORE_DELTAS, "readwrite", async (store) => {
    store.clear();
    return true;
  });
  await withStore(STORE_META, "readwrite", async (store) => {
    store.clear();
    return true;
  });

  if (isBrowser) {
    window.localStorage.removeItem(LS_CANON);
    window.localStorage.removeItem(LS_CURRENT);
    window.localStorage.removeItem(LS_DELTAS);
    window.localStorage.removeItem(LS_META);
  }
}
