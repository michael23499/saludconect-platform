import type { Metadata } from "next";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDict()).meta.precios;
  return { title: t.title, description: t.description };
}

export default function PreciosPage() {
  return (
    <>
      <Pricing />
      <FinalCTA />
    </>
  );
}
