import { requireRole } from "@backend/auth/guards";

export default async function ProfesionalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("professional");
  return <>{children}</>;
}
