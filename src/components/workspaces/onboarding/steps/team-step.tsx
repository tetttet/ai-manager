"use client";

import {
  roleOptions,
  teamSizes,
} from "@/components/workspaces/onboarding/config";
import { OptionGroup } from "@/components/workspaces/onboarding/form-fields";
import type {
  FieldErrors,
  SetProfileValue,
  WizardState,
  WizardStep,
} from "@/components/workspaces/onboarding/types";
import {
  AnimatedField,
  WizardStepPanel,
} from "@/components/workspaces/onboarding/wizard-step-panel";

export function TeamStep({
  errors,
  setProfileValue,
  state,
  step,
}: {
  errors: FieldErrors;
  setProfileValue: SetProfileValue;
  state: WizardState;
  step: WizardStep;
}) {
  return (
    <WizardStepPanel step={step}>
      <AnimatedField>
        <OptionGroup
          fieldId="role"
          label="Your role"
          value={state.profile.role || ""}
          options={roleOptions}
          columns="two"
          errors={errors}
          onChange={(value) => setProfileValue("role", value)}
        />
      </AnimatedField>

      <AnimatedField>
        <OptionGroup
          label="Team size"
          value={state.profile.teamSize || ""}
          options={teamSizes}
          columns="three"
          onChange={(value) => setProfileValue("teamSize", value)}
        />
      </AnimatedField>
    </WizardStepPanel>
  );
}
