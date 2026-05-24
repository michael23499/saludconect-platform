import ExcelJS from "exceljs";
import type { NextRequest } from "next/server";
import { requireRole } from "@backend/auth/guards";
import { listUsers } from "@backend/queries/users";
import { getDict } from "@/lib/i18n-server";
import { buildUserFilters } from "@/lib/user-filters";
import type { User } from "@backend/db";

// exceljs es una librería Node (Buffer/stream): forzamos runtime Node, no edge.
// force-dynamic porque lee cookie de idioma + BD en cada petición.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLE_KEY: Record<User["role"], string> = {
  professional: "roleProfessional",
  clinic: "roleClinic",
  admin: "roleAdmin",
};

export async function GET(request: NextRequest) {
  // Endpoint NO pasa por el layout admin → protegemos aquí explícitamente.
  await requireRole("admin");

  const sp = request.nextUrl.searchParams;
  const filters = buildUserFilters({
    role: sp.get("role") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    q: sp.get("q") ?? undefined,
  });

  const [t, users] = await Promise.all([getDict(), listUsers(filters)]);
  const d = t.dashboard.admin as Record<string, string>;

  const wb = new ExcelJS.Workbook();
  wb.creator = "SaludCoNet";
  wb.created = new Date();

  const ws = wb.addWorksheet(d.allUsers);
  ws.columns = [
    { header: d.colUser, key: "name", width: 28 },
    { header: d.colEmail, key: "email", width: 32 },
    { header: d.colRole, key: "role", width: 16 },
    { header: d.colCity, key: "city", width: 18 },
    { header: d.colPhone, key: "phone", width: 18 },
    { header: d.colStatus, key: "status", width: 14 },
    { header: d.colJoined, key: "joined", width: 14, style: { numFmt: "dd/mm/yyyy" } },
  ];

  // Cabecera: negrita sobre el navy de marca (#052F59).
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF052F59" } };
  head.alignment = { vertical: "middle" };
  head.height = 20;

  for (const u of users) {
    ws.addRow({
      name: u.fullName,
      email: u.email,
      role: d[ROLE_KEY[u.role]] ?? u.role,
      city: u.city ?? "",
      phone: u.phone ?? "",
      status: u.verified ? d.verified : d.unverified,
      joined: u.createdAt, // Date real → Excel lo trata como fecha, no texto.
    });
  }

  ws.autoFilter = { from: "A1", to: "G1" };
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = (await wb.xlsx.writeBuffer()) as unknown as ArrayBuffer;
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="usuarios-saludconet-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
