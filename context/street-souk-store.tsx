import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

type SoukStore = {
  favorites: string[]; // vendor slugs
  toggleFavorite: (vendorSlug: string) => void;
  isFavorite: (vendorSlug: string) => boolean;
  savedEvents: string[]; // schedule item ids
  toggleSavedEvent: (eventId: string) => void;
  isEventSaved: (eventId: string) => boolean;
  passportStamps: string[];
  addPassportStamp: (brand: string) => void;
  startingPoint: string;
  setStartingPoint: (point: string) => void;
};

const StoreContext = createContext<SoukStore | null>(null);
const STORAGE_KEY = "street-souk-preferences";

type FavoriteRow = {
  vendors: { slug: string } | { slug: string }[] | null;
};

export function StreetSoukStore({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.id;

  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [passportStamps, setPassportStamps] = useState<string[]>([]);
  const [startingPoint, setStartingPoint] = useState("NORTH ENTRANCE");
  const hydrated = useRef(false);

  // local-only data: starting point + passport stamps (stamps move to Supabase next)
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const data = JSON.parse(stored) as Partial<{
            startingPoint: string;
            passportStamps: string[];
          }>;
          setStartingPoint(data.startingPoint ?? "NORTH ENTRANCE");
          setPassportStamps(data.passportStamps ?? []);
        }
        hydrated.current = true;
      })
      .catch(() => {
        hydrated.current = true;
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ startingPoint, passportStamps }),
    ).catch(() => undefined);
  }, [startingPoint, passportStamps]);

  // per-user data: load when someone signs in, clear when they sign out
  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setSavedEvents([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const [fav, saved] = await Promise.all([
        supabase.from("favorites").select("vendors(slug)"),
        supabase.from("saved_items").select("schedule_item_id"),
      ]);
      if (cancelled) return;
      const favRows = (fav.data ?? []) as unknown as FavoriteRow[];
      setFavorites(
        favRows
          .map((row) =>
            Array.isArray(row.vendors) ? row.vendors[0]?.slug : row.vendors?.slug,
          )
          .filter((slug): slug is string => !!slug),
      );
      const savedRows = (saved.data ?? []) as { schedule_item_id: string }[];
      setSavedEvents(savedRows.map((row) => row.schedule_item_id));
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggleFavorite = useCallback(
    (slug: string) => {
      if (!userId) {
        router.push("/sign-in");
        return;
      }
      const on = !favorites.includes(slug);
      setFavorites((cur) => (on ? [...cur, slug] : cur.filter((i) => i !== slug)));
      supabase.rpc("set_favorite", { p_slug: slug, p_on: on }).then(({ error }) => {
        if (error) {
          // undo the optimistic change
          setFavorites((cur) =>
            on ? cur.filter((i) => i !== slug) : [...cur, slug],
          );
        }
      });
    },
    [userId, favorites],
  );

  const toggleSavedEvent = useCallback(
    (id: string) => {
      if (!userId) {
        router.push("/sign-in");
        return;
      }
      const on = !savedEvents.includes(id);
      setSavedEvents((cur) => (on ? [...cur, id] : cur.filter((i) => i !== id)));
      (async () => {
        const { error } = on
          ? await supabase.from("saved_items").insert({ schedule_item_id: id })
          : await supabase.from("saved_items").delete().eq("schedule_item_id", id);
        if (error) {
          setSavedEvents((cur) =>
            on ? cur.filter((i) => i !== id) : [...cur, id],
          );
        }
      })();
    },
    [userId, savedEvents],
  );

  const value = useMemo<SoukStore>(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite: (slug) => favorites.includes(slug),
      savedEvents,
      toggleSavedEvent,
      isEventSaved: (id) => savedEvents.includes(id),
      passportStamps,
      addPassportStamp: (brand) =>
        setPassportStamps((current) =>
          current.includes(brand) ? current : [...current, brand],
        ),
      startingPoint,
      setStartingPoint,
    }),
    [
      favorites,
      toggleFavorite,
      savedEvents,
      toggleSavedEvent,
      startingPoint,
      passportStamps,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStreetSoukStore() {
  const store = useContext(StoreContext);
  if (!store)
    throw new Error("useStreetSoukStore must be used inside StreetSoukStore");
  return store;
}