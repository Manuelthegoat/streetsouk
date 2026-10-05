import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from "react";

type SoukStore = {
  favorites: string[];
  toggleFavorite: (vendor: string) => void;
  isFavorite: (vendor: string) => boolean;
  savedEvents: string[];
  toggleSavedEvent: (event: string) => void;
  isEventSaved: (event: string) => boolean;
  startingPoint: string;
  setStartingPoint: (point: string) => void;
};

const StoreContext = createContext<SoukStore | null>(null);
const STORAGE_KEY = "street-souk-preferences";

export function StreetSoukStore({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [startingPoint, setStartingPoint] = useState("NORTH ENTRANCE");
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        const data = JSON.parse(stored) as Partial<{ favorites: string[]; savedEvents: string[]; startingPoint: string }>;
        setFavorites(data.favorites ?? []);
        setSavedEvents(data.savedEvents ?? []);
        setStartingPoint(data.startingPoint ?? "NORTH ENTRANCE");
      }
      hydrated.current = true;
    }).catch(() => { hydrated.current = true; });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ favorites, savedEvents, startingPoint })).catch(() => undefined);
  }, [favorites, savedEvents, startingPoint]);

  const value = useMemo<SoukStore>(() => ({
    favorites,
    toggleFavorite: (vendor) => setFavorites((current) => current.includes(vendor) ? current.filter((item) => item !== vendor) : [...current, vendor]),
    isFavorite: (vendor) => favorites.includes(vendor),
    savedEvents,
    toggleSavedEvent: (event) => setSavedEvents((current) => current.includes(event) ? current.filter((item) => item !== event) : [...current, event]),
    isEventSaved: (event) => savedEvents.includes(event),
    startingPoint,
    setStartingPoint,
  }), [favorites, savedEvents, startingPoint]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStreetSoukStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStreetSoukStore must be used inside StreetSoukStore");
  return store;
}
