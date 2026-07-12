import type {
  FieldErrors,
  WizardState,
  WizardStepId,
} from "@/components/workspaces/onboarding/types";

export function getStepErrors(
  stepId: WizardStepId,
  state: WizardState,
): FieldErrors {
  switch (stepId) {
    case "identity": {
      return {
        ...(state.name.trim().length >= 2
          ? {}
          : { name: "Use at least 2 characters." }),
      };
    }
    case "team": {
      return {
        ...(state.profile.role ? {} : { role: "Choose your role." }),
      };
    }
    case "outcomes": {
      return {
        ...(state.profile.goals.length > 0
          ? {}
          : { goals: "Choose at least one goal." }),
        ...(state.profile.useCases.length > 0
          ? {}
          : { useCases: "Choose at least one use case." }),
      };
    }
    case "connections": {
      return {
        ...(state.profile.channels.length > 0
          ? {}
          : { channels: "Choose at least one channel." }),
        ...(state.profile.currentTools.length > 0
          ? {}
          : { currentTools: "Choose at least one current tool." }),
      };
    }
    case "data": {
      return {
        ...(state.profile.dataVolume
          ? {}
          : { dataVolume: "Choose the closest data volume." }),
      };
    }
    case "launch": {
      return {
        ...(state.profile.launchTimeline
          ? {}
          : { launchTimeline: "Choose a launch timeline." }),
        ...(state.source ? {} : { source: "Choose how you heard about us." }),
      };
    }
  }
}

export function isStepComplete(stepId: WizardStepId, state: WizardState) {
  return Object.keys(getStepErrors(stepId, state)).length === 0;
}
