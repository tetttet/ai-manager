import HeroSection from "@/components/sections/hero-section";
import CtaSection from "@/components/sections/cta-section";
import FaqsSection from "@/components/sections/faqs-section";
import PricingSection from "@/components/sections/pricing-section";
import ReliabilitySection from "@/components/sections/reliability-section";
import React from "react";

const Page = () => {
  return (
    <div className="bg-[#f4f2eb]">
      <HeroSection />
      <ReliabilitySection />
      <PricingSection />
      <FaqsSection />
      <CtaSection />
    </div>
  );
};

export default Page;
