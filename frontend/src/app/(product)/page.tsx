import { Hero } from "@/components/landing/hero";
import {
  Capabilities,
  CustomPersonaCta,
  FeaturedPersonas,
  FinalCta,
  HowItWorks,
} from "@/components/landing/sections";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturedPersonas />
      <HowItWorks />
      <Capabilities />
      <CustomPersonaCta />
      <FinalCta />
    </>
  );
}
