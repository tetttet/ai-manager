"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function ProjectLogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "select-none font-serif text-[22px] font-semibold uppercase tracking-tight text-black"
          : "select-none font-serif text-[18px] font-semibold uppercase tracking-tight text-black"
      }
    >
      Dublios
    </div>
  );
}

export function WorkspaceTransitionScreen({
  label,
  visible,
}: {
  label: string;
  visible: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="workspace-transition"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.16 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-white/88 backdrop-blur-[2px]"
          aria-live="polite"
          aria-label={label}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex size-24 items-center justify-center rounded-full bg-[#f4f2eb] shadow-[0_18px_50px_rgba(18,17,15,0.10)]">
              <motion.span
                aria-hidden="true"
                className="absolute inset-2 rounded-full border border-black/10 border-t-black/55"
                animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                transition={{
                  duration: 0.9,
                  ease: "linear",
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
              <ProjectLogoMark />
            </div>
            <span className="text-[13px] font-medium text-black/50">{label}</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function WorkspaceFullPageLoader({ label }: { label: string }) {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#f4f2eb] px-6 text-black"
      style={{ colorScheme: "light" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex size-24 items-center justify-center rounded-full bg-white shadow-[0_18px_50px_rgba(18,17,15,0.10)]">
          <span
            aria-hidden="true"
            className="absolute inset-2 rounded-full border border-black/10 border-t-black/55 motion-safe:animate-spin"
          />
          <ProjectLogoMark />
        </div>
        <p className="text-sm font-medium text-black/55">{label}</p>
      </div>
    </main>
  );
}
