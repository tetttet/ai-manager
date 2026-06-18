import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CompanySectionProps = {
  children: ReactNode;
  className?: string;
};

export function CompanySection({ children, className }: CompanySectionProps) {
  return (
    <div
      className={cn(
        "mx-auto mt-20 max-w-7xl border-t border-black/10 pt-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

type SplitGridProps = {
  children: ReactNode;
  className?: string;
};

export function SplitGrid({ children, className }: SplitGridProps) {
  return (
    <div className={cn("grid gap-8 lg:grid-cols-[1fr_1fr]", className)}>
      {children}
    </div>
  );
}

type SectionIntroProps = {
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function SectionIntro({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: SectionIntroProps) {
  return (
    <div className={cn("text-left", className)}>
      <h2
        className={cn(
          "text-[32px] font-bold leading-tight text-black",
          titleClassName,
        )}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "mt-2 max-w-md text-[18px] leading-snug font-serif text-black/85",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
