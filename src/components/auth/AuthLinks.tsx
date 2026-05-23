"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/Providers";

/** "← Volver a iniciar sesión" — usado en /reset-password */
export function AuthBackToLogin() {
  const { t } = useApp();
  return (
    <p className="mt-8 text-center text-sm text-mist-500">
      <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
        ← {t.auth.backToLogin}
      </Link>
    </p>
  );
}

/** "¿Aún no tienes cuenta? Crea una gratis" — usado en /login */
export function AuthNoAccount() {
  const { t } = useApp();
  return (
    <p className="mt-8 text-center text-sm text-mist-500">
      {t.auth.noAccount}{" "}
      <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800">
        {t.auth.createFree}
      </Link>
    </p>
  );
}
