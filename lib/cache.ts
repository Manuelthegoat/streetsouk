import AsyncStorage from "@react-native-async-storage/async-storage";

// Bump this number whenever you change the shape of a query's data,
// so phones with old cached data start fresh instead of crashing.
const PREFIX = "ss-cache:v1:";

type Entry<T> = { data: T; savedAt: number };

const memory = new Map<string, Entry<unknown>>();
const listeners = new Map<string, Set<() => void>>();
const inflight = new Map<string, Promise<unknown>>();

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

export function subscribe(key: string, fn: () => void) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  const current = set;
  current.add(fn);
  return () => {
    current.delete(fn);
  };
}

export function peek<T>(key: string): Entry<T> | undefined {
  return memory.get(key) as Entry<T> | undefined;
}

// memory first, then disk
export async function load<T>(key: string): Promise<Entry<T> | undefined> {
  const hit = memory.get(key);
  if (hit) return hit as Entry<T>;
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return undefined;
    const entry = JSON.parse(raw) as Entry<T>;
    if (!memory.has(key)) memory.set(key, entry);
    return memory.get(key) as Entry<T>;
  } catch {
    return undefined;
  }
}

export function save<T>(key: string, data: T) {
  const entry: Entry<T> = { data, savedAt: Date.now() };
  memory.set(key, entry);
  notify(key);
  AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry)).catch(
    () => undefined,
  );
}

// share one request between screens asking for the same thing at once
export function dedupe<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const promise = run().finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

// wipes saved content only; sign-in, favorites and settings are untouched
export async function clearCache() {
  memory.clear();
  inflight.clear();
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX)));
  listeners.forEach((_set, key) => notify(key));
}