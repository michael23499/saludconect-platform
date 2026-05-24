import type { Metadata } from "next";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Planes y precios · SaludCoNet",
  description:
    "Planes para clínicas: Starter, Pro y Enterprise. Simple, transparente y sin sorpresas. Para acceder a los profesionales hay que inscribirse en un plan.",
};

export default function PreciosPage() {
  return (
    <>
      <Pricing />
      <FinalCTA />
    </>
  );
}
