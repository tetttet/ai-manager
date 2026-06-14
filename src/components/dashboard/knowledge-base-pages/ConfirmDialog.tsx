"use client";

import type { ReactNode } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmVariant?: "default" | "destructive";
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmVariant = "destructive",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6"
      onMouseDown={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-sm rounded-sm border bg-white p-4 shadow-lg"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2
            id="confirm-dialog-title"
            className="text-sm font-semibold tracking-normal"
          >
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close dialog"
            className="text-muted-foreground"
            onClick={onCancel}
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <div
          id="confirm-dialog-description"
          className="text-xs leading-5 text-muted-foreground"
        >
          {description}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="rounded-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            className="rounded-sm"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
