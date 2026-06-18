import { companyContent } from "@/constants/company";
import { ArrowRight } from "lucide-react";

import {
  GovernanceGroup,
  PurposeCard,
  TeamCard,
  ValueCard,
} from "./company/cards";
import {
  CompanySection,
  SectionIntro,
  SplitGrid,
} from "./company/section-layout";

const { governance, hero, purpose, team, values } = companyContent;

export default function Company() {
  return (
    <section className="w-full px-6 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-28 lg:pb-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <h1 className="text-[52px] font-bold leading-tight tracking-[-0.03em] text-black sm:text-[52px] lg:text-[52px]">
          {hero.title}
        </h1>

        <p className="mt-6 max-w-lg text-[16px] leading-7 text-black/70">
          {hero.description}
        </p>

        <button className="mt-8 flex w-full max-w-lg items-center justify-center gap-2 rounded-lg bg-[#0f0f0e] px-8 py-3 text-[16px] font-medium text-white transition-all hover:bg-[#1a1a19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2">
          <span>{hero.cta}</span>
          <ArrowRight className="size-4" />
        </button>
      </div>

      <CompanySection>
        <SplitGrid>
          <SectionIntro
            title={purpose.heading}
            description={purpose.description}
          />

          <div className="grid gap-8 sm:grid-cols-2">
            {purpose.cards.map((card) => (
              <PurposeCard key={card.title} {...card} />
            ))}
          </div>
        </SplitGrid>
      </CompanySection>

      <CompanySection>
        <SplitGrid>
          <SectionIntro title={team.heading} description={team.description} />

          <div className="grid gap-8 sm:grid-cols-2">
            {team.cards.map((card) => (
              <TeamCard key={card.title} {...card} />
            ))}
          </div>
        </SplitGrid>
      </CompanySection>

      <CompanySection>
        <SplitGrid>
          <SectionIntro
            title={values.heading}
            description={values.description}
          />

          <div className="-ml-4.5 grid gap-8 sm:grid-cols-2">
            {values.cards.map((card, index) => {
              const shouldSpanLastCard =
                values.cards.length % 2 === 1 &&
                index === values.cards.length - 1;

              return (
                <ValueCard
                  key={card.title}
                  order={index + 1}
                  className={shouldSpanLastCard ? "sm:col-span-2" : undefined}
                  {...card}
                />
              );
            })}
          </div>
        </SplitGrid>
      </CompanySection>

      <CompanySection>
        <SplitGrid>
          <SectionIntro title={governance.heading} />

          <div className="text-left">
            <p className="text-[18px] leading-snug font-serif text-black/75">
              {governance.description.prefix}{" "}
              <a
                href={governance.description.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {governance.description.link.label}
              </a>
              {governance.description.suffix}
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {governance.groups.map((group) => (
                <GovernanceGroup key={group.title} {...group} />
              ))}
            </div>
          </div>
        </SplitGrid>
      </CompanySection>
    </section>
  );
}
