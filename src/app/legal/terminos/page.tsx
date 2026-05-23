import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = { title: "Términos y condiciones · SaludCoNet" };

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y condiciones" updated="20 de mayo de 2026">
      <h2>1. Aceptación</h2>
      <p>Al registrarte en SaludCoNet aceptas estos términos. Si no estás conforme, no debes utilizar la plataforma.</p>

      <h2>2. Cuentas y verificación</h2>
      <p>Las cuentas se asignan a personas físicas (profesionales) o jurídicas (clínicas). Los profesionales aceptan que SaludCoNet verifique su documentación. Las clínicas aceptan facilitar datos identificativos y fiscales veraces.</p>

      <h2>3. Reservas y colaboraciones</h2>
      <p>SaludCoNet facilita la conexión entre clínicas y profesionales, pero la relación contractual entre ambas partes es directa. SaludCoNet no es empleador ni intermediario laboral.</p>

      <h2>4. Suscripciones y pagos</h2>
      <p>Las clínicas contratan una suscripción mensual. Los pagos se procesan a través de Stripe y PayPal. La suscripción se renueva automáticamente salvo cancelación previa, que puede realizarse en cualquier momento desde el panel de usuario.</p>

      <h2>5. Reembolsos</h2>
      <p>Las suscripciones son reembolsables durante los primeros 14 días desde su contratación. Pasado ese período no se realizan reembolsos parciales.</p>

      <h2>6. Conductas prohibidas</h2>
      <ul>
        <li>Suplantar la identidad de otra persona o entidad.</li>
        <li>Subir documentación falsa o adulterada.</li>
        <li>Utilizar la plataforma para actividades ajenas al sector sanitario.</li>
        <li>Eludir el sistema de mensajería para evitar la trazabilidad.</li>
      </ul>

      <h2>7. Modificaciones</h2>
      <p>SaludCoNet puede modificar estos términos. Las modificaciones materiales serán notificadas con 15 días de antelación.</p>

      <h2>8. Jurisdicción</h2>
      <p>Estos términos se rigen por la legislación española. Las partes se someten a los Juzgados y Tribunales de Madrid.</p>
    </LegalLayout>
  );
}
