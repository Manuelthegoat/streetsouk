import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";
import { usePathname, useRouter } from "expo-router";
import { useEffect } from "react";

export default function OnboardingGate() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading || loading || !user) return;
    if (!profile?.onboarded_at && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [authLoading, loading, user, profile, pathname, router]);

  return null;
}