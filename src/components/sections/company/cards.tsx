import Image from "next/image";

import { cn } from "@/lib/utils";

type TextCardProps = {
  title: string;
  description: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

function TextCard({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: TextCardProps) {
  return (
    <div className={cn("text-left", className)}>
      <h3 className={cn("font-bold leading-tight text-black", titleClassName)}>
        {title}
      </h3>
      <p className={cn("text-black/75", descriptionClassName)}>{description}</p>
    </div>
  );
}

const cardTitleClassName = "text-[24px] font-bold leading-tight text-black";
const cardDescriptionClassName =
  "mt-3 text-[18px] leading-snug font-serif text-black/75";

export function PurposeCard({ title, description }: TextCardProps) {
  return (
    <TextCard
      title={title}
      description={description}
      titleClassName={cardTitleClassName}
      descriptionClassName={cardDescriptionClassName}
    />
  );
}

type TeamCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

export function TeamCard({
  title,
  description,
  imageSrc,
  imageAlt,
}: TeamCardProps) {
  return (
    <div className="flex flex-col">
      <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-gray-200">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <h3 className={cn("mt-4", cardTitleClassName)}>{title}</h3>
      <p className={cardDescriptionClassName}>{description}</p>
    </div>
  );
}

type ValueCardProps = {
  order: number;
  title: string;
  description: string;
  className?: string;
};

export function ValueCard({
  order,
  title,
  description,
  className,
}: ValueCardProps) {
  return (
    <div className={cn("rounded-xl px-5 py-5", className)}>
      <p className="text-sm font-semibold text-black/50">
        {String(order).padStart(2, "0")}
      </p>
      <h3 className={cn("mt-2", cardTitleClassName)}>{title}</h3>
      <p className={cardDescriptionClassName}>{description}</p>
    </div>
  );
}

type GovernanceGroupProps = {
  title: string;
  description: string;
};

export function GovernanceGroup({
  title,
  description,
}: GovernanceGroupProps) {
  return (
    <div>
      <h3 className={cardTitleClassName}>{title}</h3>
      <p className={cardDescriptionClassName}>{description}</p>
    </div>
  );
}
