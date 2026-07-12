"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { WorkspaceBusinessType } from "@/lib/workspace-api";

type WorkspaceLogoProps = {
  id?: string | null;
  name?: string | null;
  businessType?: WorkspaceBusinessType | null;
  size?: "sm" | "md";
  className?: string;
};

const workspaceLogoPalettes = [
  {
    background: "linear-gradient(135deg, #1d4ed8 0%, #06b6d4 48%, #a3e635 100%)",
    shine: "rgba(255, 255, 255, 0.72)",
    accent: "rgba(14, 165, 233, 0.82)",
  },
  {
    background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 46%, #f97316 100%)",
    shine: "rgba(255, 255, 255, 0.78)",
    accent: "rgba(236, 72, 153, 0.82)",
  },
  {
    background: "linear-gradient(135deg, #047857 0%, #14b8a6 44%, #facc15 100%)",
    shine: "rgba(255, 255, 255, 0.74)",
    accent: "rgba(45, 212, 191, 0.84)",
  },
  {
    background: "linear-gradient(135deg, #be123c 0%, #f43f5e 44%, #38bdf8 100%)",
    shine: "rgba(255, 255, 255, 0.76)",
    accent: "rgba(251, 113, 133, 0.84)",
  },
  {
    background: "linear-gradient(135deg, #4338ca 0%, #8b5cf6 45%, #2dd4bf 100%)",
    shine: "rgba(255, 255, 255, 0.74)",
    accent: "rgba(129, 140, 248, 0.84)",
  },
  {
    background: "linear-gradient(135deg, #0f766e 0%, #84cc16 48%, #fb7185 100%)",
    shine: "rgba(255, 255, 255, 0.76)",
    accent: "rgba(132, 204, 22, 0.84)",
  },
];

function getWorkspaceHash(source: string) {
  return Array.from(source).reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    7,
  );
}

function getWorkspaceInitial(name?: string | null) {
  const normalizedName = name?.trim().replace(/^[^\p{L}\p{N}]+/u, "");
  const firstLetter = normalizedName ? Array.from(normalizedName)[0] : null;

  return firstLetter?.toUpperCase() ?? "W";
}

export function WorkspaceLogo({
  id,
  name,
  businessType,
  size = "md",
  className,
}: WorkspaceLogoProps) {
  const hash = getWorkspaceHash(`${id ?? ""}:${name ?? "workspace"}`);
  const palette = workspaceLogoPalettes[hash % workspaceLogoPalettes.length];
  const isCompany = businessType === "company";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative isolate flex shrink-0 items-center justify-center overflow-hidden border border-white/25 text-white shadow-sm ring-1 ring-black/10",
        size === "md"
          ? "size-8 rounded-lg text-[0.62rem]"
          : "size-6 rounded-md text-[0.5rem]",
        className,
      )}
      style={
        {
          "--workspace-logo-bg": palette.background,
          "--workspace-logo-shine": palette.shine,
          "--workspace-logo-accent": palette.accent,
        } as CSSProperties
      }
    >
      <span className="absolute inset-0 bg-[image:var(--workspace-logo-bg)]" />
      <span className="absolute -top-1/4 -left-1/5 h-3/4 w-3/4 rounded-full bg-[var(--workspace-logo-shine)] opacity-45 blur-[1px]" />
      <span className="absolute -right-1/4 -bottom-1/5 h-4/5 w-4/5 rounded-full bg-[var(--workspace-logo-accent)] opacity-60 mix-blend-screen" />
      <span
        className={cn(
          "absolute border border-white/55 bg-white/18 backdrop-blur-[1px]",
          isCompany
            ? "inset-[28%] rotate-45 rounded-[0.22rem]"
            : "inset-[25%] rounded-full",
        )}
      />
      <span className="relative font-semibold leading-none tracking-normal drop-shadow-sm">
        {getWorkspaceInitial(name)}
      </span>
    </span>
  );
}
