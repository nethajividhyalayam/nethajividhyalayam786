// IndexedDB-based offline storage for FeeDesk
const DB_NAME = "feedesk_offline";
const DB_VERSION = 2;

interface PendingMutation {
  id: string;
  table: string;
  type: "insert" | "update" | "delete";
  data: any;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("students")) db.createObjectStore("students", { keyPath: "id" });
      if (!db.objectStoreNames.contains("payments")) db.createObjectStore("payments", { keyPath: "id" });
      if (!db.objectStoreNames.contains("fee_structure")) db.createObjectStore("fee_structure", { keyPath: "id" });
      if (!db.objectStoreNames.contains("cash_register")) db.createObjectStore("cash_register", { keyPath: "id" });
      if (!db.objectStoreNames.contains("school_expenses")) db.createObjectStore("school_expenses", { keyPath: "id" });
      if (!db.objectStoreNames.contains("pending_mutations")) db.createObjectStore("pending_mutations", { keyPath: "id" });
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putAll(storeName: string, items: any[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    for (const item of items) store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function deleteItem(storeName: string, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function setMeta(key: string, value: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("meta", "readwrite");
    const store = tx.objectStore("meta");
    store.put({ key, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getMeta(key: string): Promise<any> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("meta", "readonly");
    const store = tx.objectStore("meta");
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

export const offlineDb = {
  // Cache data locally
  cacheStudents: (students: any[]) => putAll("students", students),
  cachePayments: (payments: any[]) => putAll("payments", payments),
  cacheFeeStructure: (items: any[]) => putAll("fee_structure", items),
  cacheCashRegister: (items: any[]) => putAll("cash_register", items),
  cacheSchoolExpenses: (items: any[]) => putAll("school_expenses", items),

  // Get cached data
  getCachedStudents: () => getAll<any>("students"),
  getCachedPayments: () => getAll<any>("payments"),
  getCachedFeeStructure: () => getAll<any>("fee_structure"),
  getCachedCashRegister: () => getAll<any>("cash_register"),
  getCachedSchoolExpenses: () => getAll<any>("school_expenses"),

  // Pending mutations queue
  addPendingMutation: async (mutation: Omit<PendingMutation, "id" | "timestamp">) => {
    const item: PendingMutation = {
      ...mutation,
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction("pending_mutations", "readwrite");
      tx.objectStore("pending_mutations").put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  getPendingMutations: () => getAll<PendingMutation>("pending_mutations"),
  removePendingMutation: (id: string) => deleteItem("pending_mutations", id),
  clearPendingMutations: () => clearStore("pending_mutations"),

  // Last sync timestamp
  setLastSync: (ts: number) => setMeta("lastSync", ts),
  getLastSync: () => getMeta("lastSync") as Promise<number | null>,
};
