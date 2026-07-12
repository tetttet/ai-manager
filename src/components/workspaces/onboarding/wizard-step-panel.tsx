"use client";

import { motion, type Variants, useReducedMotion } from "framer-motion";
import * as React from "react";

import type { WizardStep } from "@/components/workspaces/onboarding/types";
import { cn } from "@/lib/utils";

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function AnimatedField({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : fieldVariants}
      transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function WizardStepPanel({
  children,
  className,
  step,
}: {
  children: React.ReactNode;
  className?: string;
  step: WizardStep;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.24,
            ease: "easeOut",
            staggerChildren: 0.045,
            delayChildren: 0.03,
          },
        },
      }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
      className={cn("space-y-5", className)}
    >
      <AnimatedField>
        <div className="space-y-1.5 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-black/42">
            {step.label}
          </p>
          <h2 className="font-serif text-[34px] font-medium leading-none tracking-tight text-black sm:text-[42px]">
            {step.title}
          </h2>
          <p className="mx-auto max-w-md text-sm leading-5 text-black/52">
            {step.description}
          </p>
        </div>
      </AnimatedField>

      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}
