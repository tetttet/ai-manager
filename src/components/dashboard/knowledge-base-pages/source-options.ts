import type { LucideIcon } from "lucide-react";
import { File, Globe2, Table2, Type } from "lucide-react";

import { defaultSourceMode } from "./source-types";
import type { SourceMode, SourceType } from "./source-types";

export const sourceTypeOrder: SourceType[] = [
  "website",
  "document",
  "table",
  "text",
];

export const sourceTypeConfig: Record<
  SourceType,
  {
    label: string;
    actionLabel: string;
    icon: LucideIcon;
    accentClassName: string;
    badgeClassName: string;
  }
> = {
  website: {
    label: "Website",
    actionLabel: "Add website",
    icon: Globe2,
    accentClassName:
      "border-sky-200 bg-sky-100 text-sky-700 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-800",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },
  document: {
    label: "Document",
    actionLabel: "Add document",
    icon: File,
    accentClassName:
      "border-amber-200 bg-amber-100 text-amber-700 hover:border-amber-300 hover:bg-amber-100 hover:text-amber-800",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },
  table: {
    label: "Table",
    actionLabel: "Add table",
    icon: Table2,
    accentClassName:
      "border-emerald-200 bg-emerald-100 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  text: {
    label: "Text Input",
    actionLabel: "Add text",
    icon: Type,
    accentClassName:
      "border-pink-200 bg-pink-100 text-pink-700 hover:border-pink-300 hover:bg-pink-100 hover:text-pink-800",
    badgeClassName: "border-pink-200 bg-pink-50 text-pink-700",
  },
};

export const sourceModeOptions: {
  value: SourceMode;
  label: string;
  badgeClassName: string;
}[] = [
  {
    value: "extra high",
    label: "Extra high",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
  },
  {
    value: "high",
    label: "High",
    badgeClassName: "border-orange-200 bg-orange-50 text-orange-700",
  },
  {
    value: "medium",
    label: "Medium",
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    value: "low",
    label: "Low",
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-700",
  },
];

export function getSourceModeConfig(mode: SourceMode) {
  return (
    sourceModeOptions.find((option) => option.value === mode) ??
    sourceModeOptions.find((option) => option.value === defaultSourceMode) ??
    sourceModeOptions[0]
  );
}
