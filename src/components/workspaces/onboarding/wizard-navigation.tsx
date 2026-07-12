"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WizardNavigation({
  canContinue,
  isBusy,
  isFirstStep,
  isLastStep,
  isSaving,
  onBack,
}: {
  canContinue: boolean;
  isBusy: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSaving: boolean;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-black/10 bg-white/80 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isFirstStep || isBusy}
        className="h-10 rounded-[13px] border-black/10 bg-white px-4 text-black hover:border-black/20 hover:bg-[#fbfaf6] focus-visible:ring-black/10"
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <Button
        type="submit"
        disabled={isBusy}
        aria-disabled={!canContinue || isBusy}
        className={cn(
          "h-10 rounded-[13px] bg-black px-5 text-white shadow-[0_12px_28px_rgba(18,17,15,0.15)] hover:bg-black/85 focus-visible:ring-black/15",
          !canContinue && "bg-black/75 hover:bg-black/80",
        )}
      >
        {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
        {isLastStep ? (isSaving ? "Creating..." : "Create workspace") : "Continue"}
        {!isLastStep ? <ArrowRight className="size-4" /> : null}
      </Button>
    </div>
  );
}
