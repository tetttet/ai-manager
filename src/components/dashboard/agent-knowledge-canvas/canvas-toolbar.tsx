import { Maximize2, Move, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";

type CanvasToolbarProps = {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onAutoArrange: () => void;
  onResetView: () => void;
};

export function CanvasToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutoArrange,
  onResetView,
}: CanvasToolbarProps) {
  return (
    <div className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-sm border border-zinc-200 bg-white p-1 shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-sm"
        aria-label="Zoom out"
        title="Zoom out"
        onClick={onZoomOut}
      >
        <ZoomOut className="size-4" />
      </Button>

      <span className="w-12 text-center text-[11px] font-semibold text-zinc-600">
        {Math.round(zoom * 100)}%
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-sm"
        aria-label="Zoom in"
        title="Zoom in"
        onClick={onZoomIn}
      >
        <ZoomIn className="size-4" />
      </Button>

      <span className="mx-1 h-5 w-px bg-zinc-200" />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-sm"
        aria-label="Fit view"
        title="Fit view"
        onClick={onFitView}
      >
        <Maximize2 className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-sm"
        aria-label="Auto arrange"
        title="Auto arrange"
        onClick={onAutoArrange}
      >
        <Move className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-sm"
        aria-label="Reset view"
        title="Reset view"
        onClick={onResetView}
      >
        <RotateCcw className="size-4" />
      </Button>
    </div>
  );
}
