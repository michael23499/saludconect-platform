"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/components/providers/Providers";

type Props = {
  next?: string;
};

export function GoogleSignInButton({ next }: Props) {
  const { t } = useApp();
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    const supabase = createClient();
    // Sin `next`, el callback decide el destino según el rol del perfil
    // (dashboardPathForRole → /admin, /dashboard/clinic, etc.). Solo forzamos
    // `next` cuando hay un destino explícito (p.ej. /set-password tras magic link).
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (next) callbackUrl.searchParams.set("next", next);
    const redirectTo = callbackUrl.toString();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Google sign-in error:", error.message);
      }
      setLoading(false);
    }
    // Si no hay error, el navegador ya está redirigiendo a Google — no toques setLoading.
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-mist-200 bg-white text-sm font-medium text-ink-800 hover:bg-mist-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Spinner size="sm" /> : <GoogleIcon />}
      {loading ? t.auth.connecting : t.auth.continueGoogle}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3.1 0 5.9 1.2 8 3.1l5.7-5.7A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7A20 20 0 0 0 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5 0 9.6-1.9 13-5l-6-5.2c-2 1.4-4.5 2.2-7 2.2-5.2 0-9.6-3.3-11.2-8L6.3 33.1A20 20 0 0 0 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.5l6 5.2c-.4.4 6.7-4.9 6.7-14.7 0-1.2-.1-2.3-.3-3.5z"
      />
    </svg>
  );
}
