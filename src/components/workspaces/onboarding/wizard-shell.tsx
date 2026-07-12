"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as React from "react";

import type { WizardStep } from "@/components/workspaces/onboarding/types";
import { ProjectLogoMark } from "@/components/workspaces/onboarding/wizard-transition-screen";

export function WizardShell({
  activeStep,
  children,
  errorMessage,
  formRef,
  navigation,
  onSubmit,
  progress,
}: {
  activeStep: WizardStep;
  children: React.ReactNode;
  errorMessage: string | null;
  formRef: React.RefObject<HTMLFormElement | null>;
  navigation: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  progress: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main
      className="min-h-screen bg-[#f4f2eb] px-4 py-4 text-black sm:px-6 lg:px-8"
      style={{ colorScheme: "light" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-32px)] w-full max-w-[700px] flex-col justify-center gap-4 py-3 sm:py-5">
        <header className="text-center">
          <div className="mx-auto">
            <ProjectLogoMark compact />
          </div>
        </header>

        {progress}

        <motion.form
          ref={formRef}
          onSubmit={onSubmit}
          layout
          transition={{
            layout: {
              duration: shouldReduceMotion ? 0 : 0.2,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          aria-label={activeStep.label}
          className="overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(18,17,15,0.10)]"
        >
          <div className="relative">
            <div className="px-5 py-5 sm:px-7 sm:py-6">{children}</div>

            <AnimatePresence initial={false}>
              {errorMessage ? (
                <motion.div
                  key={errorMessage}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.16 }}
                  className="mx-5 mb-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 sm:mx-7"
                >
                  {errorMessage}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <div>{navigation}</div>
        </motion.form>
      </div>
    </main>
  );
}
