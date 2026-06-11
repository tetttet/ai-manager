"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { plans } from "@/constants/sections";

type Billing = "monthly" | "yearly";
type PricingTab = "individual" | "team";

const yearlyDiscount = 0.83;

const pricingTabs: { label: string; value: PricingTab }[] = [
  { label: "Individual", value: "individual" },
  { label: "Team & Enterprise", value: "team" },
];

const billingOptions: { label: string; value: Billing; width: string }[] = [
  { label: "Monthly", value: "monthly", width: "w-[80px]" },
  { label: "Yearly", value: "yearly", width: "w-[100px]" },
];

export default function PricingSection() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [tab, setTab] = useState<PricingTab>("individual");

  return (
    <section className="w-full py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-3xl font-medium tracking-tight md:text-[36px] font-serif"
        >
          Plans that grow with you
        </motion.h2>

        {/* Tabs */}
        <div className="mt-5 flex justify-center">
          <div className="relative grid grid-cols-2 rounded-md bg-[#e7dece] p-1">
            <motion.div
              layoutId="pricing-tab"
              className={`absolute inset-y-1 w-[136px] rounded-md bg-black sm:w-[160px] ${
                tab === "individual" ? "left-1" : "right-1"
              }`}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            />

            {pricingTabs.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`relative z-10 h-11 w-[136px] whitespace-nowrap text-sm font-medium transition-colors sm:w-[160px] ${
                  tab === value
                    ? "text-white"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-7 grid items-stretch gap-6 lg:grid-cols-3"
          >
            {plans(tab).map((plan, index) => {
              const price =
                billing === "monthly"
                  ? plan.monthlyPrice
                  : Math.round(plan.monthlyPrice * 12 * yearlyDiscount);

              const isMiddle = index === 1;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.4,
                  }}
                  whileHover={{
                    y: -3,
                  }}
                  className="flex h-full flex-col rounded-md bg-[#e7dece] p-6 transition-shadow hover:shadow-sm"
                >
                  <div className="flex min-h-[112px] flex-col justify-between gap-4 sm:min-h-[88px]">
                    <div className="flex min-w-0 flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <h3 className="truncate whitespace-nowrap text-2xl font-semibold">
                        {plan.name}
                      </h3>

                      {isMiddle && (
                        <div className="flex shrink-0 items-center gap-3">
                          <div className="relative flex rounded-md bg-black/5 p-1">
                            <motion.div
                              layoutId="billing-switch"
                              className={`absolute inset-y-1 rounded-md bg-black ${
                                billing === "monthly"
                                  ? "left-1 w-[80px]"
                                  : "right-1 w-[100px]"
                              }`}
                            />

                            {billingOptions.map(({ label, value, width }) => (
                              <button
                                key={value}
                                onClick={() => setBilling(value)}
                                className={`relative z-10 h-9 ${width} whitespace-nowrap text-sm transition-colors ${
                                  billing === value
                                    ? "text-white"
                                    : "text-neutral-600 hover:text-black"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>

                          <span className="whitespace-nowrap text-sm font-medium text-blue-600">
                            Save 17%
                          </span>
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="-mt-6 flex min-h-[48px] items-end gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={price}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-4xl font-bold"
                      >
                        ${price}
                      </motion.span>
                    </AnimatePresence>

                    <span className="pb-1 text-sm text-neutral-500">
                      / {billing === "monthly" ? "month" : "year"}
                    </span>
                  </div>

                  <button
                    onClick={() => alert(`${plan.name} selected`)}
                    className="mt-6 h-12 w-full rounded-md bg-black text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    {plan.button}
                  </button>

                  <div className="mt-6 h-px bg-black/10" />

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-neutral-700"
                      >
                        <span className="shrink-0 text-green-700">✓</span>
                        <span className="min-w-0">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
