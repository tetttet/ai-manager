"use client";

import {
  goals,
  useCases,
} from "@/components/workspaces/onboarding/config";
import { MultiChoiceGroup } from "@/components/workspaces/onboarding/form-fields";
import type {
  FieldErrors,
  ToggleProfileValue,
  WizardState,
  WizardStep,
} from "@/components/workspaces/onboarding/types";
import {
  AnimatedField,
  WizardStepPanel,
} from "@/components/workspaces/onboarding/wizard-step-panel";

export function OutcomesStep({
  errors,
  state,
  step,
  toggleProfileValue,
}: {
  errors: FieldErrors;
  state: WizardState;
  step: WizardStep;
  toggleProfileValue: ToggleProfileValue;
}) {
  return (
    <WizardStepPanel step={step}>
      <AnimatedField>
        <MultiChoiceGroup
          fieldId="goals"
          label="Goals"
          options={goals}
          values={state.profile.goals}
          errors={errors}
          onToggle={(value) => toggleProfileValue("goals", value)}
        />
      </AnimatedField>

      <AnimatedField>
        <MultiChoiceGroup
          fieldId="useCases"
          label="Use cases"
          options={useCases}
          values={state.profile.useCases}
          errors={errors}
          onToggle={(value) => toggleProfileValue("useCases", value)}
        />
      </AnimatedField>
    </WizardStepPanel>
  );
}
