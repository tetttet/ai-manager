import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import type {
  WorkspaceBusinessType,
  WorkspacePayload,
} from "@/lib/workspace-api";

export type WizardState = WorkspacePayload & {
  profile: WorkspacePayload["profile"] & {
    goals: string[];
    useCases: string[];
    channels: string[];
    currentTools: string[];
    dataTypes: string[];
    painPoints: string[];
  };
};

export type Choice = {
  label: string;
  value: string;
};

export type BusinessTypeChoice = {
  description: string;
  icon: LucideIcon;
  label: string;
  value: WorkspaceBusinessType;
};

export type WizardStepId =
  | "identity"
  | "team"
  | "outcomes"
  | "connections"
  | "data"
  | "launch";

export type WizardStep = {
  description: string;
  id: WizardStepId;
  label: string;
  title: string;
};

export type WizardFieldId =
  | "channels"
  | "currentTools"
  | "dataVolume"
  | "goals"
  | "launchTimeline"
  | "name"
  | "role"
  | "source"
  | "sourceDetail"
  | "successMetric"
  | "useCases";

export type FieldErrors = Partial<Record<WizardFieldId, string>>;

export type ProfileArrayKey =
  | "channels"
  | "currentTools"
  | "dataTypes"
  | "goals"
  | "painPoints"
  | "useCases";

export type SetProfileValue = <
  Key extends keyof WizardState["profile"],
>(
  key: Key,
  value: WizardState["profile"][Key],
) => void;

export type ToggleProfileValue = (key: ProfileArrayKey, value: string) => void;

export type SetWizardState = React.Dispatch<React.SetStateAction<WizardState>>;
