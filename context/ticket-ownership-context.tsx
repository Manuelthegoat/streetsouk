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
import { AppState } from "react-native";
import { useAuth } from "@/context/auth-context";
import {
  clearLegacyTicketCache,
  fetchTicketOwnership,
  readTicketOwnership,
} from "@/lib/attendee-tickets";

type TicketOwnershipValue = {
  loading: boolean;
  hasTicketsForEvent: (eventSlug: string) => boolean | null;
  refresh: () => Promise<string[] | null>;
};

const TicketOwnershipContext = createContext<TicketOwnershipValue | null>(null);

export function TicketOwnershipProvider({ children }: PropsWithChildren) {
  const { user, loading: authLoading } = useAuth();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [eventSlugs, setEventSlugs] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const ownerIdRef = useRef<string | null>(null);
  const inFlight = useRef<{ ownerId: string; promise: Promise<string[] | null> } | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) return null;
    const requestedOwner = user.id;
    if (inFlight.current?.ownerId === requestedOwner) return inFlight.current.promise;
    const request = ++requestId.current;
    setLoading(true);
    const promise = (async (): Promise<string[] | null> => {
      try {
        const found = await fetchTicketOwnership(requestedOwner);
        if (request !== requestId.current || ownerIdRef.current !== requestedOwner) return null;
        setOwnerId(requestedOwner);
        setEventSlugs(found);
        return found;
      } catch {
        // Keep the last saved ownership result if the network is unavailable.
        return null;
      } finally {
        if (request === requestId.current) setLoading(false);
      }
    })();
    inFlight.current = { ownerId: requestedOwner, promise };
    void promise.finally(() => {
      if (inFlight.current?.promise === promise) inFlight.current = null;
    });
    return promise;
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    requestId.current += 1;
    ownerIdRef.current = user?.id ?? null;
    inFlight.current = null;
    setOwnerId(user?.id ?? null);
    setEventSlugs(null);
    if (!user?.id) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    void clearLegacyTicketCache().catch(() => {});
    void readTicketOwnership(user.id).catch(() => null).then((cached) => {
      if (!active) return;
      setEventSlugs(cached);
      // Launch the server check as soon as the locally saved result is ready.
      void refresh();
    });
    return () => {
      active = false;
      requestId.current += 1;
    };
  }, [authLoading, refresh, user?.id]);

  useEffect(() => {
    let previous = AppState.currentState;
    const subscription = AppState.addEventListener("change", (next) => {
      if (typeof previous === "string" && /inactive|background/.test(previous) && next === "active" && user?.id) {
        void refresh();
      }
      previous = next;
    });
    return () => subscription.remove();
  }, [refresh, user?.id]);

  const hasTicketsForEvent = useCallback((eventSlug: string) => {
    if (!user?.id || ownerId !== user.id || eventSlugs === null) return null;
    return eventSlugs.includes(eventSlug);
  }, [eventSlugs, ownerId, user?.id]);

  const value = useMemo(() => ({ loading, hasTicketsForEvent, refresh }), [loading, hasTicketsForEvent, refresh]);
  return <TicketOwnershipContext.Provider value={value}>{children}</TicketOwnershipContext.Provider>;
}

export function useTicketOwnership() {
  const value = useContext(TicketOwnershipContext);
  if (!value) throw new Error("useTicketOwnership must be used inside TicketOwnershipProvider");
  return value;
}
