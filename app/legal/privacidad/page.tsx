import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = { title: "Política de privacidad · SaludCoNet" };

export default function PrivacidadPage() {
  return (
    <LegalLayout
      title="Política de privacidad"
      updated="20 de mayo de 2026"
      intro="En SaludCoNet nos tomamos la protección de datos personales tan en serio como tu clínica se toma a sus pacientes."
    >
      <h2>1. Responsable del tratamiento</h2>
      <p>El responsable del tratamiento de tus datos personales es SaludCoNet S.L. (en adelante, "SaludCoNet"), con domicilio en Madrid, España, y CIF B-00000000. Puedes contactar con nuestra Delegada de Protección de Datos en <a href="mailto:dpd@saludconet.demo">dpd@saludconet.demo</a>.</p>

      <h2>2. Datos que tratamos</h2>
      <p>Tratamos los datos que tú nos facilitas al registrarte, completar tu perfil, contratar nuestros servicios o ponerte en contacto con nosotros. Esto incluye, según corresponda:</p>
      <ul>
        <li>Datos identificativos: nombre, apellidos, DNI o NIE.</li>
        <li>Datos de contacto: email, teléfono, dirección.</li>
        <li>Datos profesionales: titulación, número de colegiado, certificados, especialidad.</li>
        <li>Datos económicos: información de facturación y método de pago (gestionado por Stripe y PayPal).</li>
        <li>Datos de navegación: cookies, IP, idioma del navegador.</li>
      </ul>

      <h2>3. Finalidades del tratamiento</h2>
      <ul>
        <li>Gestionar tu cuenta y prestar los servicios de la plataforma.</li>
        <li>Verificar tu identidad y documentación profesional.</li>
        <li>Conectar clínicas y profesionales sanitarios para reservas y colaboraciones.</li>
        <li>Cobrar las suscripciones de las clínicas a través de pasarelas seguras.</li>
        <li>Enviar comunicaciones operativas y, si lo autorizas, comerciales.</li>
        <li>Cumplir con las obligaciones legales aplicables, especialmente las sanitarias.</li>
      </ul>

      <h2>4. Base jurídica</h2>
      <p>Tratamos tus datos en base a la ejecución del contrato (uso de la plataforma), el cumplimiento de obligaciones legales, el interés legítimo de SaludCoNet (mejora del servicio y prevención del fraude) y, cuando aplica, tu consentimiento expreso.</p>

      <h2>5. Conservación</h2>
      <p>Conservamos tus datos mientras mantengas tu cuenta activa y, posteriormente, durante los plazos exigidos legalmente para la atención de posibles reclamaciones.</p>

      <h2>6. Destinatarios</h2>
      <p>Tus datos podrán ser comunicados, en función de la relación contractual, a las clínicas o profesionales con los que interactúes en la plataforma, así como a nuestros proveedores tecnológicos (alojamiento en la UE, pasarelas de pago, mensajería transaccional). Todos ellos están sujetos a contratos de tratamiento conforme al RGPD.</p>

      <h2>7. Tus derechos</h2>
      <p>Tienes derecho a acceder, rectificar y suprimir tus datos, así como a oponerte, limitar su tratamiento y portarlos. Puedes ejercerlos escribiendo a <a href="mailto:dpd@saludconet.demo">dpd@saludconet.demo</a>. También puedes reclamar ante la Agencia Española de Protección de Datos (AEPD).</p>

      <h2>8. Seguridad</h2>
      <p>Aplicamos medidas técnicas y organizativas razonables para proteger tus datos, incluyendo cifrado en tránsito (TLS), cifrado en reposo de documentos sensibles y controles de acceso por roles.</p>
    </LegalLayout>
  );
}
