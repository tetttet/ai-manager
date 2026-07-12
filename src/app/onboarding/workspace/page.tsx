import { Suspense } from "react";

import { WorkspaceFullPageLoader } from "@/components/workspaces/onboarding/wizard-transition-screen";
import { WorkspaceOnboardingWizard } from "@/components/workspaces/workspace-onboarding-wizard";

export default function WorkspaceOnboardingPage() {
  return (
    <Suspense fallback={<WorkspaceFullPageLoader label="Preparing workspace..." />}>
      <WorkspaceOnboardingWizard />
    </Suspense>
  );
}
