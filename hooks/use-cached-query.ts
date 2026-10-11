import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { dedupe, load, peek, save, subscribe } from "@/lib/cache";

type Options = {
  ttl?: number; // how long saved data counts as fresh (ms)
  enabled?: boolean;
};

type Snapshot<T> = { key: string; data: T | undefined; error: string | null };

export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  { ttl = 5 * 60_000, enabled = true }: Options = {},
) {
  const [snap, setSnap] = useState<Snapshot<T>>(() => ({
    key,
    data: peek<T>(key)?.data,
    error: null,
  }));
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  // a snapshot made for a different key is never shown
  const current: Snapshot<T> =
    snap.key === key ? snap : { key, data: peek<T>(key)?.data, error: null };

  const patch = useCallback(
    (changes: Partial<Omit<Snapshot<T>, "key">>) => {
      setSnap((prev) => ({
        ...(prev.key === key
          ? prev
          : { key, data: peek<T>(key)?.data, error: null }),
        ...changes,
        key,
      }));
    },
    [key],
  );

  const fetchNow = useCallback(
    async (force = false) => {
      try {
        const fresh = force
          ? await fetcherRef.current()
          : await dedupe(key, () => fetcherRef.current());
        save(key, fresh); // updates every screen showing this key
      } catch (e) {
        patch({ error: e instanceof Error ? e.message : "Something went wrong" });
      }
    },
    [key, patch],
  );

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      const cached = await load<T>(key);
      if (cancelled) return;
      if (cached) patch({ data: cached.data, error: null });
      if (!cached || Date.now() - cached.savedAt > ttl) fetchNow();
    })();

    const unsubscribe = subscribe(key, () => {
      const entry = peek<T>(key);
      if (entry) {
        patch({ data: entry.data, error: null });
      } else {
        // cache was cleared
        patch({ data: undefined, error: null });
        fetchNow();
      }
    });

    const appState = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      const entry = peek<T>(key);
      if (!entry || Date.now() - entry.savedAt > ttl) fetchNow();
    });

    return () => {
      cancelled = true;
      unsubscribe();
      appState.remove();
    };
  }, [key, enabled, ttl, fetchNow, patch]);

  const reload = useCallback(() => fetchNow(true), [fetchNow]);

  return {
    data: current.data,
    loading: enabled && current.data === undefined && current.error === null,
    // saved content stays on screen; errors only show when there's nothing to show
    error: current.data === undefined ? current.error : null,
    reload,
  };
}