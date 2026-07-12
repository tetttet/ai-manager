"use client";

import {
  channels,
  currentTools,
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

export function ConnectionsStep({
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
          fieldId="channels"
          label="Channels"
          options={channels}
          values={state.profile.channels}
          errors={errors}
          onToggle={(value) => toggleProfileValue("channels", value)}
        />
      </AnimatedField>

      <AnimatedField>
        <MultiChoiceGroup
          fieldId="currentTools"
          label="Current tools"
          options={currentTools}
          values={state.profile.currentTools}
          errors={errors}
          onToggle={(value) => toggleProfileValue("currentTools", value)}
        />
      </AnimatedField>
    </WizardStepPanel>
  );
}
