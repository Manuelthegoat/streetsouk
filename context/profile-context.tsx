import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  email_updates: boolean;
  push_updates: boolean;
  onboarded_at: string | null;
};

type Changes = Partial<Omit<Profile, "id">>;

type Value = {
  profile: Profile | null;
  loading: boolean;
  // returns an error message, or null if it worked
  save: (changes: Changes) => Promise<string | null>;
};

const Ctx = createContext<Value | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState<{
    userId: string;
    profile: Profile | null;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        // on a network error we stay "loading", so nobody gets sent to onboarding by mistake
        if (!cancelled && !error) {
          setState({ userId, profile: data as Profile | null });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const save = useCallback(
    async (changes: Changes) => {
      if (!userId) return "You need to be signed in.";
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...changes })
        .select("*")
        .single();
      if (error) {
        if (error.code === "23505") return "That username is already taken.";
        if (error.code === "23514") return "Please check the details you entered.";
        return error.message;
      }
      setState({ userId, profile: data as Profile });
      return null;
    },
    [userId],
  );

  const value = useMemo<Value>(
    () => ({
      profile: state && state.userId === userId ? state.profile : null,
      loading: !!userId && state?.userId !== userId,
      save,
    }),
    [state, userId, save],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfile() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}