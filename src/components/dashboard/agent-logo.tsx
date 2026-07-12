"use client";

import type { CSSProperties } from "react";
import { Bot } from "lucide-react";

import { cn } from "@/lib/utils";

type AgentLogoProps = {
  id?: string | null;
  name?: string | null;
  size?: "xs" | "md" | "lg";
  className?: string;
};

const agentLogoPalettes = [
  {
    background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 48%, #f43f5e 100%)",
    glow: "rgba(125, 211, 252, 0.72)",
    accent: "rgba(244, 114, 182, 0.76)",
  },
  {
    background: "linear-gradient(135deg, #22c55e 0%, #14b8a6 46%, #3b82f6 100%)",
    glow: "rgba(187, 247, 208, 0.72)",
    accent: "rgba(45, 212, 191, 0.78)",
  },
  {
    background: "linear-gradient(135deg, #f97316 0%, #ec4899 48%, #8b5cf6 100%)",
    glow: "rgba(254, 215, 170, 0.76)",
    accent: "rgba(196, 181, 253, 0.74)",
  },
  {
    background: "linear-gradient(135deg, #0891b2 0%, #a3e635 46%, #f59e0b 100%)",
    glow: "rgba(165, 243, 252, 0.72)",
    accent: "rgba(250, 204, 21, 0.78)",
  },
  {
    background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 46%, #10b981 100%)",
    glow: "rgba(199, 210, 254, 0.74)",
    accent: "rgba(45, 212, 191, 0.76)",
  },
];

function getAgentHash(source: string) {
  return Array.from(source).reduce(
    (hash, character) => (hash * 33 + character.charCodeAt(0)) >>> 0,
    11,
  );
}

export function AgentLogo({
  id,
  name,
  size = "md",
  className,
}: AgentLogoProps) {
  const hash = getAgentHash(`${id ?? ""}:${name ?? "bot"}`);
  const palette = agentLogoPalettes[hash % agentLogoPalettes.length];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative isolate flex shrink-0 items-center justify-center overflow-hidden border border-white/30 text-white shadow-sm ring-1 ring-black/10",
        size === "lg"
          ? "size-11 rounded-sm"
          : size === "md"
            ? "size-10 rounded-sm"
            : "size-5 rounded-[0.35rem]",
        className,
      )}
      style={
        {
          "--agent-logo-bg": palette.background,
          "--agent-logo-glow": palette.glow,
          "--agent-logo-accent": palette.accent,
        } as CSSProperties
      }
    >
      <span className="absolute inset-0 bg-[image:var(--agent-logo-bg)]" />
      <span className="absolute -left-1/4 -top-1/4 size-3/4 rounded-full bg-[var(--agent-logo-glow)] opacity-60 blur-[1px]" />
      <span className="absolute -bottom-1/3 -right-1/4 size-4/5 rounded-full bg-[var(--agent-logo-accent)] opacity-70 mix-blend-screen" />
      <span className="absolute inset-[18%] rounded-full border border-white/45 bg-white/10 backdrop-blur-[1px]" />
      <Bot
        className={cn(
          "relative drop-shadow-sm",
          size === "xs" ? "size-3" : "size-5",
        )}
        strokeWidth={2}
      />
    </span>
  );
}
