import Image from "next/image";
import React from "react";

const HeroSection = () => {
  return (
    <section className="w-full px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1360px] items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-medium leading-[0.96] tracking-tight text-black sm:text-6xl lg:text-[64px] font-serif">
            Build calmer systems for smarter teams.
          </h1>

          <p className="mt-4 max-w-xl text-[16px] leading-6 text-black/62">
            Plan, automate, and measure your AI operations from one focused
            workspace built for speed and control.
          </p>

          <button className="mt-4 h-12 rounded-md bg-black px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f2eb]">
            Get started
          </button>
        </div>

        <div className="relative">
          <div className="relative">
            <Image
              src="/images/etc/hero-image.png"
              alt="AI manager dashboard preview"
              width={1400}
              height={800}
              priority
              className="h-auto w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
