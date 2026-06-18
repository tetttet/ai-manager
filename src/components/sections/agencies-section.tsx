"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

type AgencyTeam = {
  description: string;
  href: string;
  title: string;
};

type Feature = {
  category: string;
  description: string;
  image: string;
  title: string;
};

type Publication = {
  category: string;
  date: string;
  title: string;
};

const agencyTeams: AgencyTeam[] = [
  {
    title: "Strategy",
    href: "#strategy",
    description:
      "Shape client intake, scopes, and AI roadmaps around measurable business outcomes.",
  },
  {
    title: "Creative Ops",
    href: "#creative-ops",
    description:
      "Move campaign briefs, asset reviews, and approvals through a single operating layer.",
  },
  {
    title: "Automation",
    href: "#automation",
    description:
      "Deploy AI agents for recurring client work without losing human control.",
  },
  {
    title: "Client Success",
    href: "#client-success",
    description:
      "Track delivery health, risks, feedback, and reporting across every account.",
  },
];

const featured: Feature[] = [
  {
    title: "Designing an AI operating rhythm for modern agencies",
    category: "Field guide",
    description:
      "How account, strategy, and delivery teams can use AI Manager to coordinate faster client work with clearer ownership.",
    image: "/images/etc/team-operations.jpg",
  },
  {
    title: "From loose prompts to repeatable client workflows",
    category: "Automation",
    description:
      "A practical model for turning agency know-how into reusable agent playbooks.",
    image: "/images/etc/team-product.jpg",
  },
  {
    title: "Governance that keeps the work moving",
    category: "Trust",
    description:
      "Review gates, permissions, and account-level context built for agency delivery.",
    image: "/images/etc/team-policy.jpg",
  },
  {
    title: "Measuring the real margin impact of AI",
    category: "Insights",
    description:
      "What to watch when AI starts touching briefs, production, QA, and reporting.",
    image: "/images/etc/team-research.jpg",
  },
];

const publications: Publication[] = [
  {
    date: "Jun 18, 2026",
    category: "Operations",
    title: "How agencies centralize AI work without slowing delivery",
  },
  {
    date: "Jun 12, 2026",
    category: "Strategy",
    title: "Building client-ready AI roadmaps from discovery notes",
  },
  {
    date: "Jun 4, 2026",
    category: "Automation",
    title: "Reusable agent workflows for monthly reporting",
  },
  {
    date: "May 29, 2026",
    category: "Creative Ops",
    title: "Keeping briefs, drafts, and approvals in sync",
  },
  {
    date: "May 21, 2026",
    category: "Trust",
    title: "Practical governance for AI-assisted client work",
  },
  {
    date: "May 14, 2026",
    category: "Client Success",
    title: "Account health signals for AI-enabled agencies",
  },
  {
    date: "May 6, 2026",
    category: "Insights",
    title: "Measuring capacity gains across delivery teams",
  },
  {
    date: "Apr 25, 2026",
    category: "Automation",
    title: "When to hand work to agents and when to escalate",
  },
  {
    date: "Apr 18, 2026",
    category: "Strategy",
    title: "Designing AI services clients can understand",
  },
  {
    date: "Apr 10, 2026",
    category: "Operations",
    title: "A cleaner weekly operating review for agency leaders",
  },
];

function FeaturedCard({
  feature,
  priority,
}: {
  feature: Feature;
  priority?: boolean;
}) {
  return (
    <article className="group grid overflow-hidden rounded-md border border-black/10 bg-[#fbfaf6] md:grid-cols-[1.08fr_0.92fr]">
      <div className="relative min-h-75 overflow-hidden bg-black/5 md:min-h-107.5">
        <Image
          src={feature.image}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex min-h-75 flex-col p-6 sm:p-8 lg:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.08em] text-[#64713f]">
          {feature.category}
        </p>

        <h2 className="mt-3 max-w-xl text-[26px] font-medium leading-[1.04] tracking-tight text-black sm:text-[26px]">
          {feature.title}
        </h2>

        <p className="mt-3 max-w-md text-[16px] leading-6 text-black/64">
          {feature.description}
        </p>
      </div>
    </article>
  );
}

export default function AgenciesSection() {
  const [query, setQuery] = useState("");

  const visiblePublications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return publications;
    }

    return publications.filter((publication) =>
      [publication.date, publication.category, publication.title]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <main className="w-full bg-[#f4f2eb] text-[#141311]">
      <section className="px-5 pb-14 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:pt-26">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.45fr_1fr] lg:items-start">
            {/* Left */}
            <h1 className="font-serif text-[52px] font-medium leading-none tracking-tight text-black sm:text-[72px] lg:text-[52px]">
              Agencies
            </h1>

            {/* Right */}
            <div className="max-w-4xl">
              <p className="text-[22px] leading-[1.18] tracking-tight text-black sm:text-[28px] lg:text-[24px]">
                AI Manager helps agencies plan, automate, and measure client
                work as AI becomes part of everyday delivery.
              </p>

              <div className="mt-6">
                <p className="text-sm font-medium uppercase tracking-[0.08em] text-black/48">
                  Agency teams:
                </p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                  {agencyTeams.map((team) => (
                    <a
                      key={team.title}
                      href={team.href}
                      className="text-[17px] font-medium leading-none text-black underline decoration-black/25 underline-offset-4 transition-colors hover:text-black/60"
                    >
                      {team.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden rounded-md bg-black/10 md:grid-cols-2 lg:grid-cols-4">
          {agencyTeams.map((team) => (
            <article
              id={team.href.slice(1)}
              key={team.title}
              className="min-h-45 bg-[#fbfaf6] p-6 sm:p-8"
            >
              <h2 className="text-[26px] font-medium leading-none tracking-tight text-black">
                {team.title}
              </h2>
              <p className="mt-4 text-[16px] font-serif text-black/62">
                {team.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <FeaturedCard feature={featured[0]} priority />

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {featured.slice(1).map((feature) => (
              <article
                key={feature.title}
                className="overflow-hidden rounded-md border border-black/10 bg-[#fbfaf6]"
              >
                <div className="relative aspect-[4/3] bg-black/5">
                  <Image
                    src={feature.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <p className="text-sm font-medium uppercase tracking-[0.08em] text-[#64713f]">
                    {feature.category}
                  </p>
                  <h3 className="mt-3 text-[26px] font-medium leading-[1.08] tracking-tight text-black">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-[16px] font-serif leading-6 text-black/62">
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 border-b border-black/14 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="font-serif text-[44px] font-medium leading-none tracking-tight text-black sm:text-[52px]">
              Publications
            </h2>

            <label className="relative w-full max-w-105">
              <span className="sr-only">Search publications</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-black/38"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="h-12 w-full rounded-md border border-black/12 bg-[#fbfaf6] pl-11 pr-4 text-[15px] text-black outline-none transition-colors placeholder:text-black/38 focus:border-black/40"
              />
            </label>
          </div>

          <div className="hidden grid-cols-[180px_220px_1fr] border-b border-black/12 py-3 text-sm font-medium uppercase tracking-[0.08em] text-black/42 md:grid">
            <span>Date</span>
            <span className="ml-6">Category</span>
            <span className="ml-12">Title</span>
          </div>

          <div>
            {visiblePublications.map((publication) => (
              <article
                key={`${publication.date}-${publication.title}`}
                className="grid gap-2 border-b border-black/12 py-3 text-[16px] leading-6 md:grid-cols-[180px_220px_1fr] md:gap-6"
              >
                <span className="text-black/54">{publication.date}</span>
                <span className="font-medium text-[#64713f]">
                  {publication.category}
                </span>
                <h3 className="font-medium text-black">{publication.title}</h3>
              </article>
            ))}
          </div>

          {visiblePublications.length === 0 && (
            <p className="border-b border-black/12 py-3 text-[16px] text-black/58">
              No publications match your search.
            </p>
          )}
        </div>
      </section>

      <section className="px-5 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
        <div className="mx-auto overflow-hidden rounded-md bg-[#151512] text-white lg:grid lg:max-w-7xl lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex min-h-[360px] flex-col justify-between p-8 sm:p-10 lg:p-12">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.08em] text-white/52">
                Agency program
              </p>
              <h2 className="mt-4 max-w-xl font-serif text-[44px] font-medium leading-[1.02] tracking-tight sm:text-[52px]">
                Build the next client workflow.
              </h2>
            </div>

            <Link
              href="/sign-up"
              className="mt-10 text-[14px] inline-flex h-10 w-fit items-center rounded-md bg-white px-5 text-sm font-medium text-black transition-opacity hover:opacity-[0.86] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Start building
            </Link>
          </div>

          <div className="relative min-h-[300px] bg-white/5 lg:min-h-[420px]">
            <Image
              src="/images/etc/team-research.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 700px, 100vw"
              className="object-cover opacity-[0.86]"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
