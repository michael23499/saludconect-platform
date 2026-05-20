import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = { title: "Política de cookies · SaludCoNet" };

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de cookies" updated="20 de mayo de 2026">
      <h2>¿Qué son las cookies?</h2>
      <p>Las cookies son pequeños archivos que se almacenan en tu navegador cuando visitas un sitio web. Permiten reconocerte y mejorar tu experiencia de uso.</p>
      <h2>Cookies que utilizamos</h2>
      <ul>
        <li><strong>Técnicas:</strong> imprescindibles para el funcionamiento de la plataforma (sesión, idioma, tema).</li>
        <li><strong>Analíticas:</strong> nos permiten entender cómo usas la plataforma de forma agregada y anónima.</li>
        <li><strong>Funcionales:</strong> recuerdan tus preferencias (ciudad por defecto, vista de calendario).</li>
      </ul>
      <h2>Gestión de cookies</h2>
      <p>Puedes aceptar, rechazar o configurar el uso de cookies en cualquier momento desde el banner de configuración o desde los ajustes de tu navegador.</p>
    </LegalLayout>
  );
}
