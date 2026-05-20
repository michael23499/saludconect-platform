import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import { ChatWidget } from "@/components/chat/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SaludCoNet · La nueva red profesional sanitaria",
  description:
    "Conectamos clínicas privadas con profesionales sanitarios verificados. Reserva talento sanitario de forma rápida, segura y profesional.",
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
const THEME_INIT = `
(function(){try{
  var l=localStorage.getItem('scn:lang'); if(l==='es'||l==='en'){document.documentElement.lang=l;}
  var t=localStorage.getItem('scn:theme');
  if(t!=='dark'&&t!=='light'){t='light';}
  if(t==='dark'){document.documentElement.classList.add('dark');}
  document.documentElement.setAttribute('data-theme',t);
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
