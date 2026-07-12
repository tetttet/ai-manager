"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import type {
  Choice,
  FieldErrors,
  WizardFieldId,
} from "@/components/workspaces/onboarding/types";
import { cn } from "@/lib/utils";

type FieldErrorProps = {
  id: string;
  message?: string;
};

export function FieldError({ id, message }: FieldErrorProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div id={id} className="min-h-4 text-[12px] leading-4">
      <AnimatePresence initial={false}>
        {message ? (
          <motion.p
            key={message}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.16 }}
            className="text-red-600"
          >
            {message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type FieldFrameProps = {
  children: React.ReactNode;
  className?: string;
  description?: string;
  error?: string;
  fieldId?: WizardFieldId;
  label: string;
};

function FieldFrame({
  children,
  className,
  description,
  error,
  fieldId,
  label,
}: FieldFrameProps) {
  const labelId = React.useId();
  const descriptionId = React.useId();
  const errorId = React.useId();
  const describedBy = [description ? descriptionId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      data-field-error={error ? "true" : undefined}
      data-field-id={fieldId}
      className={cn("space-y-2", className)}
    >
      <div className="space-y-0.5">
        <div className="text-sm font-medium tracking-tight text-black" id={labelId}>
          {label}
        </div>
        {description ? (
          <p id={descriptionId} className="text-[13px] leading-5 text-black/55">
            {description}
          </p>
        ) : null}
      </div>
      <div
        aria-describedby={describedBy || undefined}
        aria-labelledby={labelId}
        role="group"
      >
        {children}
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

type TextInputFieldProps = {
  autoComplete?: string;
  className?: string;
  description?: string;
  error?: string;
  fieldId: WizardFieldId;
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function TextInputField({
  autoComplete,
  className,
  description,
  error,
  fieldId,
  id,
  label,
  onChange,
  placeholder,
  value,
}: TextInputFieldProps) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = [description ? descriptionId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      data-field-error={error ? "true" : undefined}
      data-field-id={fieldId}
      className={cn("space-y-1.5", className)}
    >
      <label className="text-sm font-medium tracking-tight text-black" htmlFor={id}>
        {label}
      </label>
      {description ? (
        <p id={descriptionId} className="text-[13px] leading-5 text-black/55">
          {description}
        </p>
      ) : null}
      <Input
        id={id}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-11 rounded-[13px] border-black/10 bg-white px-4 text-[15px] shadow-[0_1px_0_rgba(18,17,15,0.04)] transition-all placeholder:text-black/35 hover:border-black/20 focus-visible:border-black/35 focus-visible:ring-4 focus-visible:ring-black/10",
          error &&
            "border-red-300 bg-red-50/40 focus-visible:border-red-400 focus-visible:ring-red-100",
        )}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

type TextAreaFieldProps = {
  className?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function TextAreaField({
  className,
  id,
  label,
  onChange,
  placeholder,
  value,
}: TextAreaFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium tracking-tight text-black" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-24 w-full resize-y rounded-[13px] border border-black/10 bg-white px-4 py-3 text-[15px] leading-6 text-black shadow-[0_1px_0_rgba(18,17,15,0.04)] outline-none transition-all placeholder:text-black/35 hover:border-black/20 focus-visible:border-black/35 focus-visible:ring-4 focus-visible:ring-black/10"
      />
    </div>
  );
}

type ChoiceButtonProps = {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

export function ChoiceButton({ active, children, onClick }: ChoiceButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.16 }}
      className={cn(
        "group flex min-h-10 items-center justify-between gap-2.5 rounded-[13px] border px-3 py-2 text-left text-[13px] font-medium outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-black/10",
        active
          ? "border-black bg-black text-white shadow-[0_10px_24px_rgba(18,17,15,0.12)]"
          : "border-black/10 bg-white text-black shadow-[0_1px_0_rgba(18,17,15,0.04)] hover:border-black/25 hover:bg-[#fbfaf6]",
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
          active
            ? "border-white/25 bg-white text-black"
            : "border-black/10 text-transparent group-hover:border-black/20",
        )}
        aria-hidden="true"
      >
        <AnimatePresence initial={false}>
          {active ? (
            <motion.span
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.14 }}
            >
              <Check className="size-3.5" strokeWidth={2.2} />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

type OptionGroupProps = {
  columns?: "two" | "three";
  description?: string;
  errors?: FieldErrors;
  fieldId?: WizardFieldId;
  label: string;
  onChange: (value: string) => void;
  options: Choice[];
  value: string;
  visibleCount?: number;
};

export function OptionGroup({
  columns = "two",
  description,
  errors,
  fieldId,
  label,
  onChange,
  options,
  value,
  visibleCount,
}: OptionGroupProps) {
  const error = fieldId ? errors?.[fieldId] : undefined;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const visibleOptions = React.useMemo(() => {
    if (!visibleCount || isExpanded) {
      return options;
    }

    const initialOptions = options.slice(0, visibleCount);
    const selectedHiddenOption = options
      .slice(visibleCount)
      .find((option) => option.value === value);

    return selectedHiddenOption
      ? [...initialOptions, selectedHiddenOption]
      : initialOptions;
  }, [isExpanded, options, value, visibleCount]);
  const hiddenCount = visibleCount
    ? Math.max(options.length - visibleCount, 0)
    : 0;

  return (
    <FieldFrame
      label={label}
      description={description}
      error={error}
      fieldId={fieldId}
    >
      <div
        className={cn(
          "grid gap-2.5",
          columns === "three"
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : "sm:grid-cols-2",
        )}
      >
        {visibleOptions.map((option) => (
          <ChoiceButton
            key={option.value}
            active={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </ChoiceButton>
        ))}
      </div>
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="mt-2 text-[13px] font-medium text-black/48 outline-none transition-colors hover:text-black focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-black/10"
        >
          {isExpanded ? "Show less" : `More options (${hiddenCount})`}
        </button>
      ) : null}
    </FieldFrame>
  );
}

type MultiChoiceGroupProps = {
  columns?: "two" | "three";
  description?: string;
  errors?: FieldErrors;
  fieldId?: WizardFieldId;
  label: string;
  onToggle: (value: string) => void;
  options: Choice[];
  values: string[];
  visibleCount?: number;
};

export function MultiChoiceGroup({
  columns = "three",
  description,
  errors,
  fieldId,
  label,
  onToggle,
  options,
  values,
  visibleCount,
}: MultiChoiceGroupProps) {
  const error = fieldId ? errors?.[fieldId] : undefined;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const visibleOptions = React.useMemo(() => {
    if (!visibleCount || isExpanded) {
      return options;
    }

    const initialOptions = options.slice(0, visibleCount);
    const initialValues = new Set(initialOptions.map((option) => option.value));
    const selectedHiddenOptions = options
      .slice(visibleCount)
      .filter((option) => values.includes(option.value))
      .filter((option) => !initialValues.has(option.value));

    return [...initialOptions, ...selectedHiddenOptions];
  }, [isExpanded, options, values, visibleCount]);
  const hiddenCount = visibleCount
    ? Math.max(options.length - visibleCount, 0)
    : 0;

  return (
    <FieldFrame
      label={label}
      description={description}
      error={error}
      fieldId={fieldId}
    >
      <div
        className={cn(
          "grid gap-2.5",
          columns === "three"
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : "sm:grid-cols-2",
        )}
      >
        {visibleOptions.map((option) => (
          <ChoiceButton
            key={option.value}
            active={values.includes(option.value)}
            onClick={() => onToggle(option.value)}
          >
            {option.label}
          </ChoiceButton>
        ))}
      </div>
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="mt-2 text-[13px] font-medium text-black/48 outline-none transition-colors hover:text-black focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-black/10"
        >
          {isExpanded ? "Show less" : `More options (${hiddenCount})`}
        </button>
      ) : null}
    </FieldFrame>
  );
}

type ExpandableSectionProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  description?: string;
  title: string;
};

export function ExpandableSection({
  children,
  defaultOpen = false,
  description,
  title,
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const contentId = React.useId();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="rounded-[14px] border border-black/10 bg-[#fbfaf6] shadow-[0_1px_0_rgba(18,17,15,0.04)]">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 rounded-[14px] px-4 py-3 text-left outline-none transition-colors hover:bg-black/[0.025] focus-visible:ring-4 focus-visible:ring-black/10"
      >
        <span>
          <span className="block text-sm font-medium tracking-tight text-black">
            {title}
          </span>
          {description ? (
            <span className="mt-0.5 block text-[13px] leading-5 text-black/55">
              {description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-black/45 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={contentId}
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-black/10 px-4 py-3.5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
