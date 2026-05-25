import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { TopProgress } from "@/components/ui/TopProgress";
import { getCurrentUser } from "@backend/auth";
import { countUnreadNotifications } from "@backend/queries/notifications";
import { getLang } from "@/lib/i18n-server";

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

// Inline pre-hydration script to avoid theme flash.
// First-time visitors get LIGHT mode by default; we only honor an explicit
// saved choice in localStorage. System preference is ignored on purpose.
// El idioma lo fija el servidor desde la cookie (ver getLang). El script solo
// gestiona el theme para evitar el flash de modo claro/oscuro.
const THEME_INIT = `
(function(){try{
  document.documentElement.classList.add('js');
  var t=localStorage.getItem('scn:theme');
  if(t!=='dark'&&t!=='light'){t='light';}
  if(t==='dark'){document.documentElement.classList.add('dark');}
  document.documentElement.setAttribute('data-theme',t);
}catch(e){}})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [current, lang] = await Promise.all([getCurrentUser(), getLang()]);
  // Conteo de notificaciones sin leer para la campana del header (solo clínica
  // y profesional; el admin no recibe notificaciones del marketplace).
  const unread =
    current?.profile && (current.profile.role === "clinic" || current.profile.role === "professional")
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
    <html lang={lang} className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {/* Aplica el tema antes de hidratar para evitar el flash. beforeInteractive
            inyecta el script en el <head> del HTML inicial (patrón oficial Next). */}
        <Script id="scn-theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <Providers initialLang={lang}>
          <TopProgress />
          <Header user={userForHeader} unread={unread} />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
