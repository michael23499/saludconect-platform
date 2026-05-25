import { DashboardShell, PageHeader } from "@/components/dashboard/Shell";
import { SurgeryForm } from "@/components/dashboard/SurgeryForm";
import { NAV_CLINICA } from "@/lib/dashboard-nav";
import { getDict } from "@/lib/i18n-server";
import { requireRole } from "@backend/auth/guards";
import { listClinicUsers } from "@backend/queries/users";

export const metadata = { title: "Publicar cirugía · SaludCoNet" };

export default async function PublicarCirugiaPage() {
  const me = await requireRole("clinic");
  const t = (await getDict()).dashboard.surgeries;
  const isAdmin = me.profile.role === "admin";
  const user = {
    name: me.profile.fullName,
    subtitle: isAdmin ? "Administrador" : me.profile.city ? `Clínica · ${me.profile.city}` : "Clínica",
    avatarUrl: me.profile.avatarUrl,
  };

  // El admin publica en nombre de una clínica: le ofrecemos el listado.
  const clinics = isAdmin ? await listClinicUsers() : [];

  return (
    <DashboardShell role="Clínica" user={user} nav={NAV_CLINICA}>
      <PageHeader
        backHref="/dashboard/clinic/surgeries"
        backLabel={isAdmin ? t.detailBackAdmin : t.detailBack}
        title={t.publishTitle}
        subtitle={t.publishSubtitle}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SurgeryForm isAdmin={isAdmin} clinics={clinics} />

        <aside className="space-y-4">
          <div className="rounded-2xl border border-mist-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">
              {t.howItWorks}
            </div>
            <ol className="mt-3 space-y-3 text-sm">
              {[
                ["1", t.step1Title, t.step1Desc],
                ["2", t.step2Title, t.step2Desc],
                ["3", t.step3Title, t.step3Desc],
                ["4", t.step4Title, t.step4Desc],
              ].map(([n, title, d]) => (
                <li key={n} className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                    {n}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink-900">{title}</div>
                    <div className="text-xs text-mist-500">{d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
