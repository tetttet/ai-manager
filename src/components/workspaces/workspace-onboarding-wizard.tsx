"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  initialWorkspaceWizardState,
  wizardSteps,
} from "@/components/workspaces/onboarding/config";
import { ConnectionsStep } from "@/components/workspaces/onboarding/steps/connections-step";
import { DataVolumeStep } from "@/components/workspaces/onboarding/steps/data-volume-step";
import { IdentityStep } from "@/components/workspaces/onboarding/steps/identity-step";
import { LaunchStep } from "@/components/workspaces/onboarding/steps/launch-step";
import { OutcomesStep } from "@/components/workspaces/onboarding/steps/outcomes-step";
import { TeamStep } from "@/components/workspaces/onboarding/steps/team-step";
import type {
  FieldErrors,
  ProfileArrayKey,
  WizardState,
  WizardStepId,
} from "@/components/workspaces/onboarding/types";
import {
  getStepErrors,
  isStepComplete,
} from "@/components/workspaces/onboarding/validation";
import { WizardNavigation } from "@/components/workspaces/onboarding/wizard-navigation";
import { WizardProgress } from "@/components/workspaces/onboarding/wizard-progress";
import { WizardShell } from "@/components/workspaces/onboarding/wizard-shell";
import {
  WorkspaceFullPageLoader,
  WorkspaceTransitionScreen,
} from "@/components/workspaces/onboarding/wizard-transition-screen";
import {
  createWorkspace,
  fetchWorkspaces,
  getWorkspaceStorageKey,
} from "@/lib/workspace-api";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((currentValue) => currentValue !== value)
    : [...values, value];
}

function getNextStepIndex(currentIndex: number, direction: "back" | "next") {
  return direction === "next"
    ? Math.min(currentIndex + 1, wizardSteps.length - 1)
    : Math.max(currentIndex - 1, 0);
}

export function WorkspaceOnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const accountId = user?.id ?? null;
  const isCreateMode = searchParams.get("mode") === "create";
  const shouldReduceMotion = useReducedMotion();

  const [stepIndex, setStepIndex] = React.useState(0);
  const [state, setState] = React.useState<WizardState>(() => ({
    ...initialWorkspaceWizardState,
    profile: { ...initialWorkspaceWizardState.profile },
  }));
  const [attemptedStepIds, setAttemptedStepIds] = React.useState<WizardStepId[]>(
    [],
  );
  const [isChecking, setIsChecking] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const activeStep = wizardSteps[stepIndex];
  const didAttemptCurrentStep = attemptedStepIds.includes(activeStep.id);
  const currentErrors: FieldErrors = didAttemptCurrentStep
    ? getStepErrors(activeStep.id, state)
    : {};
  const canContinue = isStepComplete(activeStep.id, state);
  const isLastStep = stepIndex === wizardSteps.length - 1;
  const isBusy = isSaving;

  React.useEffect(() => {
    let shouldIgnore = false;

    async function checkExistingWorkspaces() {
      if (!isLoaded) {
        return;
      }

      if (!accountId) {
        setIsChecking(false);
        return;
      }

      if (isCreateMode) {
        setIsChecking(false);
        return;
      }

      try {
        const { workspaces } = await fetchWorkspaces({ getToken });

        if (!shouldIgnore && workspaces.length > 0) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // Let the create request surface the API problem if the user continues.
      }

      if (!shouldIgnore) {
        setIsChecking(false);
      }
    }

    void checkExistingWorkspaces();

    return () => {
      shouldIgnore = true;
    };
  }, [accountId, getToken, isCreateMode, isLoaded, router]);

  function setProfileValue<Key extends keyof WizardState["profile"]>(
    key: Key,
    value: WizardState["profile"][Key],
  ) {
    setState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        [key]: value,
      },
    }));
  }

  function toggleProfileValue(key: ProfileArrayKey, value: string) {
    setProfileValue(key, toggleValue(state.profile[key], value));
  }

  function markStepAttempted(stepId: WizardStepId) {
    setAttemptedStepIds((currentStepIds) =>
      currentStepIds.includes(stepId)
        ? currentStepIds
        : [...currentStepIds, stepId],
    );
  }

  function scrollToFirstError() {
    window.setTimeout(() => {
      const firstError = formRef.current?.querySelector<HTMLElement>(
        '[data-field-error="true"]',
      );

      if (!firstError) {
        return;
      }

      firstError.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "center",
      });

      const focusTarget = firstError.querySelector<HTMLElement>(
        'input, textarea, button, [tabindex]:not([tabindex="-1"])',
      );

      focusTarget?.focus({ preventScroll: true });
    }, 0);
  }

  function validateCurrentStep(validationMessage: string) {
    const stepErrors = getStepErrors(activeStep.id, state);

    if (Object.keys(stepErrors).length === 0) {
      return true;
    }

    markStepAttempted(activeStep.id);
    setErrorMessage(validationMessage);
    scrollToFirstError();

    return false;
  }

  function moveToStep(nextStepIndex: number) {
    if (nextStepIndex === stepIndex) {
      return;
    }

    setErrorMessage(null);
    setStepIndex(nextStepIndex);
  }

  function goNext() {
    if (
      !validateCurrentStep(
        isLastStep
          ? "Fill the required choices before creating workspace."
          : "Fill the required choices before continuing.",
      )
    ) {
      return;
    }

    moveToStep(getNextStepIndex(stepIndex, "next"));
  }

  function goBack() {
    setErrorMessage(null);
    moveToStep(getNextStepIndex(stepIndex, "back"));
  }

  async function submitWorkspace() {
    if (!accountId) {
      setErrorMessage("Sign in to create a workspace.");
      return;
    }

    if (!validateCurrentStep("Fill the required choices before creating workspace.")) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      const workspace = await createWorkspace(
        {
          name: state.name.trim(),
          businessType: state.businessType,
          source: state.source,
          profile: state.profile,
        },
        { getToken },
      );

      window.localStorage.setItem(
        getWorkspaceStorageKey(accountId),
        workspace.id,
      );
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    if (isLastStep) {
      void submitWorkspace();
      return;
    }

    goNext();
  }

  function renderStep() {
    switch (activeStep.id) {
      case "identity":
        return (
          <IdentityStep
            step={activeStep}
            state={state}
            setState={setState}
            errors={currentErrors}
          />
        );
      case "team":
        return (
          <TeamStep
            step={activeStep}
            state={state}
            setProfileValue={setProfileValue}
            errors={currentErrors}
          />
        );
      case "outcomes":
        return (
          <OutcomesStep
            step={activeStep}
            state={state}
            toggleProfileValue={toggleProfileValue}
            errors={currentErrors}
          />
        );
      case "connections":
        return (
          <ConnectionsStep
            step={activeStep}
            state={state}
            toggleProfileValue={toggleProfileValue}
            errors={currentErrors}
          />
        );
      case "data":
        return (
          <DataVolumeStep
            step={activeStep}
            state={state}
            setProfileValue={setProfileValue}
            errors={currentErrors}
          />
        );
      case "launch":
        return (
          <LaunchStep
            step={activeStep}
            state={state}
            setState={setState}
            errors={currentErrors}
          />
        );
    }
  }

  if (isChecking || !isLoaded) {
    return <WorkspaceFullPageLoader label="Preparing workspace..." />;
  }

  return (
    <WizardShell
      activeStep={activeStep}
      errorMessage={errorMessage}
      formRef={formRef}
      onSubmit={handleSubmit}
      progress={<WizardProgress activeIndex={stepIndex} steps={wizardSteps} />}
      navigation={
        <WizardNavigation
          canContinue={canContinue}
          isBusy={isBusy}
          isFirstStep={stepIndex === 0}
          isLastStep={isLastStep}
          isSaving={isSaving}
          onBack={goBack}
        />
      }
    >
      <div className="relative min-h-[320px]">
        <AnimatePresence mode="wait" initial={false}>
          {!isSaving ? (
            <motion.div
              key={activeStep.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            >
              {renderStep()}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <WorkspaceTransitionScreen
          visible={isSaving}
          label="Creating workspace..."
        />
      </div>
    </WizardShell>
  );
}
