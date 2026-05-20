import { DashboardShell, PageHeader, Kpi } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { NAV_PRO, USER_PRO } from "@/lib/dashboard-nav";
import { DocumentsView } from "@/components/dashboard/DocumentsView";

export const metadata = { title: "Documentos · Profesional · SaludCoNet" };

export default function ProfesionalDocumentosPage() {
  return (
    <DashboardShell role="Profesional" user={USER_PRO} nav={NAV_PRO}>
      <PageHeader
        title="Documentos"
        subtitle="Mantén tu documentación profesional al día para acceder a más reservas."
        actions={
          <>
            <Button variant="secondary" size="sm">Descargar todo</Button>
            <Button size="sm">Subir documento</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Documentos verificados" value="6 / 9" hint="85% del perfil" tone="up" />
        <Kpi label="Pendientes de revisión" value="1" hint="Respuesta en 24 h" tone="neutral" />
        <Kpi label="Próximos a caducar" value="2" hint="En menos de 60 días" tone="down" />
        <Kpi label="Tamaño total" value="14,2 MB" hint="Espacio usado" tone="neutral" />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-amber-900">2 documentos próximos a caducar</div>
          <p className="mt-0.5 text-xs text-amber-800/90">
            Tu Certificado de Soporte Vital Avanzado y el Seguro de responsabilidad civil caducan pronto. Sustitúyelos para no perder reservas.
          </p>
        </div>
        <Badge tone="warning">Acción requerida</Badge>
      </div>

      <DocumentsView />
    </DashboardShell>
  );
}
