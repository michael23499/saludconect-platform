import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { ValueProps } from "@/components/sections/ValueProps";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Specialties } from "@/components/sections/Specialties";
import { SpainCoverageMap } from "@/components/sections/SpainCoverageMap";
import { ReputationSection } from "@/components/sections/Reputation";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <ValueProps />
      <HowItWorks />
      <Specialties />
      <SpainCoverageMap />
      <ReputationSection />
      <Testimonials />
      <Pricing />
      <FinalCTA />
    </>
  );
}
