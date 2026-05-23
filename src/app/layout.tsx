import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { getCurrentUser } from "@backend/auth";
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Providers initialLang={lang}>
          <Header user={userForHeader} />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
