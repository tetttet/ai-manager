"use client";

import { dataVolumes } from "@/components/workspaces/onboarding/config";
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

export function DataVolumeStep({
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
          fieldId="dataVolume"
          label="Data volume"
          value={state.profile.dataVolume || ""}
          options={dataVolumes}
          columns="two"
          errors={errors}
          onChange={(value) => setProfileValue("dataVolume", value)}
        />
      </AnimatedField>
    </WizardStepPanel>
  );
}
