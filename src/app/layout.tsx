import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CookieConsent } from "@/components/cookies/CookieConsent";
import { TopProgress } from "@/components/ui/TopProgress";
import { getCurrentUser } from "@backend/auth";
import { countUnreadNotifications } from "@backend/queries/notifications";
import { getLang } from "@/lib/i18n-server";
import { cookies } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SaludCoNet · La nueva red profesional sanitaria",
  description:
    "Conectamos clínicas con profesionales sanitarios verificados. Reserva talento sanitario de forma rápida, segura y profesional.",
  metadataBase: new URL("https://saludconet.demo"),
  openGraph: {
    title: "SaludCoNet · Talento sanitario bajo demanda",
    description:
      "La plataforma sanitaria del futuro: conectamos clínicas y profesionales en tiempo real.",
    type: "website",
  },
};

// Script pre-hidratación para evitar el flash de tema. El tema lo fija el
// servidor desde la cookie `scn_theme` (igual que el idioma), así que aquí solo
// reafirmamos esa misma cookie antes de que React hidrate. Leer la cookie (no
// localStorage) garantiza que coincida con lo que renderizó el servidor → sin
// hydration mismatch. Primera visita sin cookie = modo claro por defecto.
const THEME_INIT = `
(function(){try{
  document.documentElement.classList.add('js');
  var m=document.cookie.match(/(?:^|; )scn_theme=(dark|light)/);
  var t=m?m[1]:'light';
  if(t==='dark'){document.documentElement.classList.add('dark');}
  document.documentElement.setAttribute('data-theme',t);
}catch(e){}})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [current, lang] = await Promise.all([getCurrentUser(), getLang()]);
  // Tema desde cookie (igual que el idioma) para que server y client coincidan.
  const theme: "light" | "dark" =
    (await cookies()).get("scn_theme")?.value === "dark" ? "dark" : "light";
  // Conteo de notificaciones sin leer para la campana del header (solo clínica
  // y profesional; el admin no recibe notificaciones del marketplace).
  const unread =
    current?.profile &&
    (current.profile.role === "clinic" ||
      current.profile.role === "professional" ||
      current.profile.role === "admin")
      ? await countUnreadNotifications(current.profile.id)
      : 0;
  const userForHeader = current
    ? {
        fullName: current.profile?.fullName ?? current.auth.fullNameFromProvider ?? current.auth.email ?? "",
        email: current.auth.email ?? "",
        avatarUrl: current.profile?.avatarUrl ?? current.auth.avatarUrlFromProvider,
        role: current.profile?.role ?? null,
      }
    : null;

  return (
    <html
      lang={lang}
      className={`${inter.variable}${theme === "dark" ? " dark" : ""}`}
      data-theme={theme}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {/* Aplica el tema antes de hidratar para evitar el flash. beforeInteractive
            inyecta el script en el <head> del HTML inicial (patrón oficial Next). */}
        <Script id="scn-theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <Providers initialLang={lang} initialTheme={theme}>
          <TopProgress />
          <Header user={userForHeader} unread={unread} />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
          <ChatWidget />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
