import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = { title: "Aviso legal · SaludCoNet" };

export default function AvisoPage() {
  return (
    <LegalLayout title="Aviso legal" updated="20 de mayo de 2026">
      <h2>1. Datos identificativos</h2>
      <p>En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), te informamos de que esta plataforma es operada por SaludCoNet S.L., con CIF B-00000000 y domicilio social en Madrid, España. Puedes contactarnos a través de <a href="mailto:hola@saludconet.demo">hola@saludconet.demo</a>.</p>

      <h2>2. Objeto del servicio</h2>
      <p>SaludCoNet es un marketplace sanitario que conecta clínicas privadas y profesionales sanitarios para colaboraciones, turnos y jornadas profesionales. SaludCoNet no presta servicios sanitarios ni interviene en la relación profesional entre clínicas y profesionales, más allá de facilitar la conexión y la gestión administrativa de las reservas.</p>

      <h2>3. Condiciones de acceso</h2>
      <p>El acceso a la plataforma es libre y gratuito para profesionales. Las clínicas acceden mediante una suscripción mensual. El registro implica la aceptación expresa de los presentes términos y la política de privacidad.</p>

      <h2>4. Propiedad intelectual</h2>
      <p>Todos los contenidos, marcas, logotipos, código y diseño son titularidad de SaludCoNet o de sus licenciantes. Queda prohibida la reproducción total o parcial sin autorización expresa.</p>

      <h2>5. Responsabilidad</h2>
      <p>SaludCoNet realiza esfuerzos razonables para verificar la documentación profesional, pero no se responsabiliza de la veracidad de los datos aportados por las clínicas y profesionales. Las partes son responsables del cumplimiento de la legislación sanitaria, laboral y fiscal aplicable a su actividad.</p>

      <h2>6. Legislación aplicable</h2>
      <p>Las presentes condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de Madrid.</p>
    </LegalLayout>
  );
}
