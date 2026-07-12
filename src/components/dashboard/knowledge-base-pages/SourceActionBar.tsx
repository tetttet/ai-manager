"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { sourceTypeConfig, sourceTypeOrder } from "./source-options";
import type { SourceType } from "./source-types";

type SourceActionBarProps = {
  activeType: SourceType | null;
  sourceCounts: Record<SourceType, number>;
  disabledSourceTypes: Set<SourceType>;
  onAddSource: (type: SourceType) => void;
};

export function SourceActionBar({
  activeType,
  sourceCounts,
  disabledSourceTypes,
  onAddSource,
}: SourceActionBarProps) {
  return (
    <TooltipProvider>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {sourceTypeOrder.map((type) => {
          const config = sourceTypeConfig[type];
          const Icon = config.icon;
          const isActive = activeType === type;
          const isDisabled = disabledSourceTypes.has(type) && !isActive;

          return (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-pressed={isActive}
                  aria-label={config.actionLabel}
                  disabled={isDisabled}
                  onClick={() => onAddSource(type)}
                  className={cn(
                    "h-8 rounded-sm border-none px-3 text-xs shadow-none",
                    config.accentClassName,
                    isActive && "ring-2 ring-ring/30",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{config.label}</span>
                  <Badge
                    variant="outline"
                    className="ml-0.5 h-5 min-w-5 border-none bg-transparent px-1.5 text-[11px]"
                  >
                    {sourceCounts[type]}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                {config.actionLabel}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
