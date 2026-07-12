"use client";

import {
  launchTimelines,
  sourceOptions,
} from "@/components/workspaces/onboarding/config";
import { OptionGroup } from "@/components/workspaces/onboarding/form-fields";
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

export function LaunchStep({
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
  return (
    <WizardStepPanel step={step}>
      <AnimatedField>
        <OptionGroup
          fieldId="launchTimeline"
          label="Launch timeline"
          value={state.profile.launchTimeline || ""}
          options={launchTimelines}
          columns="two"
          errors={errors}
          onChange={(value) =>
            setState((currentState) => ({
              ...currentState,
              profile: {
                ...currentState.profile,
                launchTimeline: value,
              },
            }))
          }
        />
      </AnimatedField>

      <AnimatedField>
        <OptionGroup
          fieldId="source"
          label="How did you hear about us?"
          value={state.source}
          options={sourceOptions}
          columns="two"
          errors={errors}
          onChange={(value) =>
            setState((currentState) => ({ ...currentState, source: value }))
          }
        />
      </AnimatedField>
    </WizardStepPanel>
  );
}
