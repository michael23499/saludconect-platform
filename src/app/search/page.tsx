import { listPublicProfessionals } from "@backend/queries/professionals";
import { getCurrentUser } from "@backend/auth";
import { ProfessionalsDirectory, type PublicPro } from "@/components/search/ProfessionalsDirectory";
import { getDict } from "@/lib/i18n-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).meta.search;
  return { title: t.title };
}

export default async function BuscarPage() {
  // Cargamos el directorio público completo; el filtrado es EN VIVO en el cliente
  // (por nombre, especialidad o ciudad). Volumen early-stage: suficiente.
  const [pros, current] = await Promise.all([
    listPublicProfessionals({}),
    getCurrentUser(),
  ]);
  const canContact = current?.profile?.role === "clinic" || current?.profile?.role === "admin";

  return <ProfessionalsDirectory pros={pros as PublicPro[]} canContact={canContact} />;
}
