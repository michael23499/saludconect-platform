import { listPublicProfessionals } from "@backend/queries/professionals";
import { listPublicClinics } from "@backend/queries/clinics";
import { getRatingSummaries } from "@backend/queries/reviews";
import { getCurrentUser } from "@backend/auth";
import {
  ProfessionalsDirectory,
  type PublicPro,
  type PublicClinicCard,
} from "@/components/search/ProfessionalsDirectory";
import { getDict } from "@/lib/i18n-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).meta.search;
  return { title: t.title };
}

export default async function BuscarPage() {
  // Cargamos el directorio público completo (técnicos y clínicas); el filtrado
  // es EN VIVO en el cliente (por nombre, especialidad o ciudad). Volumen
  // early-stage: suficiente.
  const [pros, clinics, current] = await Promise.all([
    listPublicProfessionals({}),
    listPublicClinics(),
    getCurrentUser(),
  ]);
  const canContact = current?.profile?.role === "clinic" || current?.profile?.role === "admin";

  // Puntuación media de cada ficha (reputación pública: se muestra siempre).
  const ratings = await getRatingSummaries([
    ...pros.map((p) => p.id),
    ...clinics.map((c) => c.id),
  ]);

  // Sin sesión de clínica, NO enviamos al cliente los datos sensibles (tarifa y
  // experiencia): se ocultan de verdad, no solo visualmente.
  const safePros = canContact
    ? pros
    : pros.map((p) => ({ ...p, hourlyRate: null, yearsExperience: null }));

  return (
    <ProfessionalsDirectory
      pros={safePros as PublicPro[]}
      clinics={clinics as PublicClinicCard[]}
      ratings={ratings}
      canContact={canContact}
    />
  );
}
