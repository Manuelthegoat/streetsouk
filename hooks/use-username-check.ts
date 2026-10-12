import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const FORMAT = /^[a-z0-9_.]{3,20}$/;

export type UsernameStatus =
  | "empty"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

// lowercase, only letters, numbers, dots and underscores
export function cleanUsername(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 20);
}

export const usernameMessage: Record<UsernameStatus, string> = {
  empty: "3 TO 20 CHARACTERS. LETTERS, NUMBERS, . AND _",
  invalid: "AT LEAST 3 CHARACTERS: LETTERS, NUMBERS, . AND _",
  checking: "CHECKING...",
  available: "AVAILABLE",
  taken: "NOT AVAILABLE. TRY ANOTHER.",
  error: "COULD NOT CHECK RIGHT NOW. TRY AGAIN.",
};

// `current` is the username the person already has, which always counts as available
export function useUsernameCheck(value: string, current?: string | null) {
  const [status, setStatus] = useState<UsernameStatus>("empty");

  useEffect(() => {
    if (!value) {
      setStatus("empty");
      return;
    }
    if (!FORMAT.test(value)) {
      setStatus("invalid");
      return;
    }
    if (value === current) {
      setStatus("available");
      return;
    }
    setStatus("checking");
    let cancelled = false;
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc("username_available", {
        p_username: value,
      });
      if (cancelled) return;
      setStatus(error ? "error" : data ? "available" : "taken");
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, current]);

  return status;
}