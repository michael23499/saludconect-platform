import { requireRole } from "@backend/auth/guards";

export default async function ClinicaDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("clinic");
  return <>{children}</>;
}
