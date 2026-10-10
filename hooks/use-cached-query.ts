import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { dedupe, load, peek, save, subscribe } from "@/lib/cache";

type Options = {
  ttl?: number; // how long saved data counts as fresh (ms)
  enabled?: boolean;
};

export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  { ttl = 5 * 60_000, enabled = true }: Options = {},
) {
  const [data, setData] = useState<T | undefined>(() => peek<T>(key)?.data);
  const [loading, setLoading] = useState(() => enabled && !peek<T>(key));
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const fetchNow = useCallback(
    async (force = false) => {
      try {
        const fresh = force
          ? await fetcherRef.current()
          : await dedupe(key, () => fetcherRef.current());
        save(key, fresh); // also updates every screen showing this key
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [key],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      const cached = await load<T>(key);
      if (cancelled) return;
      if (cached) {
        setData(cached.data);
        setLoading(false);
      } else {
        setData(undefined);
        setLoading(true);
      }
      if (!cached || Date.now() - cached.savedAt > ttl) fetchNow();
    })();

    const unsubscribe = subscribe(key, () => {
      const entry = peek<T>(key);
      if (entry) {
        setData(entry.data);
        setLoading(false);
      } else {
        // cache was cleared
        setData(undefined);
        setLoading(true);
        fetchNow();
      }
    });

    // coming back to the app: refresh anything gone stale
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
  }, [key, enabled, ttl, fetchNow]);

  const reload = useCallback(() => fetchNow(true), [fetchNow]);

  return {
    data,
    loading,
    // stale content stays on screen; errors only show when there's nothing to show
    error: data === undefined ? error : null,
    reload,
  };
}