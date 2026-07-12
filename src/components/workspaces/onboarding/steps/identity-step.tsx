"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import {
  businessTypes,
} from "@/components/workspaces/onboarding/config";
import {
  TextInputField,
} from "@/components/workspaces/onboarding/form-fields";
import type {
  FieldErrors,
  SetWizardState,
  WizardState,
  WizardStep,
} from "@/components/workspaces/onboarding/types";
import {
  AnimatedField,
  WizardStepPanel,
} from "@/components/workspaces/onboarding/wizard-step-panel";
import { cn } from "@/lib/utils";

export function IdentityStep({
  errors,
  setState,
  state,
  step,
}: {
  errors: FieldErrors;
  setState: SetWizardState;
  state: WizardState;
  step: WizardStep;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <WizardStepPanel step={step}>
      <AnimatedField>
        <TextInputField
          id="workspace-name"
          fieldId="name"
          label="Workspace name"
          value={state.name}
          onChange={(value) =>
            setState((currentState) => ({ ...currentState, name: value }))
          }
          placeholder="Acme Support"
          autoComplete="organization"
          error={errors.name}
        />
      </AnimatedField>

      <AnimatedField>
        <div className="space-y-2">
          <div>
            <div className="text-sm font-medium tracking-tight text-black">
              Workspace type
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {businessTypes.map((option) => {
              const Icon = option.icon;
              const active = state.businessType === option.value;

              return (
                <motion.button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setState((currentState) => ({
                      ...currentState,
                      businessType: option.value,
                    }))
                  }
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.988 }}
                  className={cn(
                    "group rounded-[15px] border p-3.5 text-left outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-black/10",
                    active
                      ? "border-black bg-black text-white shadow-[0_18px_42px_rgba(18,17,15,0.16)]"
                      : "border-black/10 bg-white text-black shadow-[0_1px_0_rgba(18,17,15,0.04)] hover:border-black/25 hover:bg-[#fbfaf6]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-[13px] border transition-all duration-200",
                        active
                          ? "border-white/15 bg-white text-black"
                          : "border-black/10 bg-[#f4f2eb] text-black/70 group-hover:border-black/20",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                        active
                          ? "border-white/20 bg-white text-black"
                          : "border-black/10 text-transparent group-hover:border-black/20",
                      )}
                      aria-hidden="true"
                    >
                      {active ? <Check className="size-3.5" /> : null}
                    </span>
                  </div>
                  <span className="mt-3 block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-[12px] leading-4",
                      active ? "text-white/68" : "text-black/55",
                    )}
                  >
                    {option.description}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </AnimatedField>
    </WizardStepPanel>
  );
}
