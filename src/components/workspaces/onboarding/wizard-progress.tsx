"use client";

import { Progress } from "@/components/ui/progress";
import type { WizardStep } from "@/components/workspaces/onboarding/types";

export function WizardProgress({
  activeIndex,
  steps,
}: {
  activeIndex: number;
  steps: readonly WizardStep[];
}) {
  const progress = ((activeIndex + 1) / steps.length) * 100;
  const activeStep = steps[activeIndex];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2 text-[13px] font-medium text-black/55">
        <span>{activeIndex + 1}/{steps.length}</span>
        <span aria-hidden="true">·</span>
        <span className="text-black">{activeStep.label}</span>
      </div>

      <Progress
        value={progress}
        className="mx-auto h-1.5 max-w-80 bg-black/10 [&>div]:bg-black [&>div]:transition-transform [&>div]:duration-300"
      />
    </div>
  );
}
