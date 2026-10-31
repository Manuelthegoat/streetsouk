import { useCachedQuery } from "@/hooks/use-cached-query";
import { zappie } from "@/lib/zappie";
import type { ZMenus, ZStore } from "@/lib/zappie-types";

export function useZappieStore() {
  const { data, loading, error, reload } = useCachedQuery<ZStore>(
    "zappie:store",
    () => zappie<ZStore>("/store"),
    { ttl: 10 * 60_000 },
  );
  const branch = data?.branches.find((b) => b.is_default) ?? data?.branches[0];
  return { store: data, branch, loading, error, reload };
}

export function useZappieMenus() {
  const {
    store,
    branch,
    loading: storeLoading,
    error: storeError,
    reload: reloadStore,
  } = useZappieStore();

  const { data, loading, error, reload } = useCachedQuery<ZMenus>(
    `zappie:menus:${branch?.id}`,
    () => zappie<ZMenus>(`/menus?branch=${branch?.id}`),
    { ttl: 60_000, enabled: !!branch },
  );

  return {
    store,
    branch,
    menus: data,
    loading: storeLoading || (!!branch && loading),
    error:
      storeError ??
      error ??
      (!storeLoading && store && !branch
        ? "Zappie store has no branch available for its menu."
        : null),
    reload: async () => {
      await reloadStore();
      await reload();
    },
  };
}
