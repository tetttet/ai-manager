"use client";

import Link from "next/link";
import * as React from "react";
import { Loader2, Plus, Save } from "lucide-react";

import { useWorkspace } from "@/components/dashboard/workspace-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Workspace, WorkspacePayload } from "@/lib/workspace-api";

const sourceOptions = [
  { label: "Imported legacy data", value: "legacy_import" },
  { label: "Google search", value: "google" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "YouTube", value: "youtube" },
  { label: "Friend or colleague", value: "friend" },
  { label: "Community", value: "community" },
  { label: "Ad", value: "ads" },
  { label: "Event", value: "event" },
  { label: "Marketplace", value: "marketplace" },
  { label: "Social media", value: "social" },
  { label: "Agency", value: "agency" },
  { label: "Other", value: "other" },
];

const roleOptions = [
  { label: "Founder", value: "founder" },
  { label: "Operations", value: "operations" },
  { label: "Support", value: "support" },
  { label: "Sales", value: "sales" },
  { label: "Product", value: "product" },
  { label: "Engineering", value: "engineering" },
  { label: "Agency", value: "agency" },
  { label: "Other", value: "other" },
];

const teamSizeOptions = [
  { label: "Solo", value: "solo" },
  { label: "2-5", value: "2_5" },
  { label: "6-20", value: "6_20" },
  { label: "21-100", value: "21_100" },
  { label: "100+", value: "100_plus" },
];

const timelineOptions = [
  { label: "This week", value: "this_week" },
  { label: "This month", value: "this_month" },
  { label: "This quarter", value: "this_quarter" },
  { label: "Exploring", value: "exploring" },
];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function GeneralSettingsPage() {
  const { activeWorkspace, updateActiveWorkspace } = useWorkspace();

  if (!activeWorkspace) {
    return null;
  }

  return (
    <WorkspaceSettingsForm
      key={activeWorkspace.id}
      activeWorkspace={activeWorkspace}
      updateActiveWorkspace={updateActiveWorkspace}
    />
  );
}

function WorkspaceSettingsForm({
  activeWorkspace,
  updateActiveWorkspace,
}: {
  activeWorkspace: Workspace;
  updateActiveWorkspace: (payload: WorkspacePayload) => Promise<Workspace>;
}) {
  const [form, setForm] = React.useState<WorkspacePayload>(() => ({
    name: activeWorkspace.name,
    businessType: activeWorkspace.businessType,
    source: activeWorkspace.source,
    profile: activeWorkspace.profile || {},
  }));
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  function updateProfile(key: string, value: string) {
    setForm((currentForm) =>
      currentForm
        ? {
            ...currentForm,
            profile: {
              ...currentForm.profile,
              [key]: value,
            },
          }
        : currentForm,
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form || form.name.trim().length < 2) {
      setErrorMessage("Workspace name is required.");
      return;
    }

    try {
      setStatus("saving");
      setErrorMessage(null);
      const savedWorkspace = await updateActiveWorkspace({
        ...form,
        name: form.name.trim(),
      });

      setForm({
        name: savedWorkspace.name,
        businessType: savedWorkspace.businessType,
        source: savedWorkspace.source,
        profile: savedWorkspace.profile || {},
      });
      setStatus("saved");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus("idle");
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">
            Workspace settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit the active workspace profile used by agents and knowledge base.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/onboarding/workspace?mode=create">
            <Plus className="size-4" />
            New workspace
          </Link>
        </Button>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="workspace-name">
              Workspace name
            </label>
            <Input
              id="workspace-name"
              value={form.name}
              onChange={(event) =>
                setForm((currentForm) =>
                  currentForm
                    ? { ...currentForm, name: event.target.value }
                    : currentForm,
                )
              }
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={form.businessType}
              onValueChange={(value) =>
                setForm((currentForm) =>
                  currentForm
                    ? {
                        ...currentForm,
                        businessType: value as WorkspacePayload["businessType"],
                      }
                    : currentForm,
                )
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SettingsSelect
            label="Role"
            value={form.profile.role || ""}
            options={roleOptions}
            onChange={(value) => updateProfile("role", value)}
          />
          <SettingsSelect
            label="Team size"
            value={form.profile.teamSize || ""}
            options={teamSizeOptions}
            onChange={(value) => updateProfile("teamSize", value)}
          />
          <SettingsSelect
            label="Launch timeline"
            value={form.profile.launchTimeline || ""}
            options={timelineOptions}
            onChange={(value) => updateProfile("launchTimeline", value)}
          />
          <SettingsSelect
            label="Discovery source"
            value={form.source}
            options={sourceOptions}
            onChange={(value) =>
              setForm((currentForm) =>
                currentForm ? { ...currentForm, source: value } : currentForm,
              )
            }
          />

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="success-metric">
              Success metric
            </label>
            <Input
              id="success-metric"
              value={form.profile.successMetric || ""}
              onChange={(event) =>
                updateProfile("successMetric", event.target.value)
              }
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="source-detail">
              Source detail
            </label>
            <Input
              id="source-detail"
              value={form.profile.sourceDetail || ""}
              onChange={(event) =>
                updateProfile("sourceDetail", event.target.value)
              }
              className="h-10"
            />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <label className="text-sm font-medium" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            value={form.profile.notes || ""}
            onChange={(event) => updateProfile("notes", event.target.value)}
            className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          {status === "saved" ? (
            <span className="text-sm text-muted-foreground">Saved</span>
          ) : null}
          <Button type="submit" disabled={status === "saving"}>
            {status === "saving" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save workspace
          </Button>
        </div>
      </form>
    </section>
  );
}

function SettingsSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
