export type NavLink = {
  href: string;
  label: string;
};

export type NavFeaturedLink = {
  description: string;
  href: string;
  title: string;
};

export type NavColumn = {
  links: NavLink[];
  title: string;
};

export type NavDropdown = {
  columns: NavColumn[];
  featured: NavFeaturedLink[];
  summary: string;
};

export type NavItem = NavLink & {
  dropdown?: NavDropdown;
};

export const navigation: NavItem[] = [
  { href: "#research", label: "Research" },
  { href: "#economic-futures", label: "Economic Futures" },
  {
    href: "#commitments",
    label: "Commitments",
    dropdown: {
      summary:
        "How Hermes approaches safety, privacy, and long-term trust across research and deployment.",
      featured: [
        {
          title: "Safety",
          href: "#commitments-safety",
          description:
            "Core safeguards, evals, and release standards for production models.",
        },
        {
          title: "Privacy",
          href: "#commitments-privacy",
          description:
            "A clear view into data handling, retention, and user protection.",
        },
        {
          title: "Responsible AI",
          href: "#commitments-responsible-ai",
          description:
            "The policies and review practices that shape how Hermes systems ship.",
        },
      ],
      columns: [
        {
          title: "Trust",
          links: [
            { label: "Security", href: "#security" },
            { label: "Trust Center", href: "#trust-center" },
          ],
        },
        {
          title: "Principles",
          links: [{ label: "Research Principles", href: "#research-principles" }],
        },
      ],
    },
  },
  {
    href: "#learn",
    label: "Learn",
    dropdown: {
      summary:
        "Guides, tutorials, and documentation for teams building practical systems with Hermes/AI.",
      featured: [
        {
          title: "Overview",
          href: "#learn-overview",
          description:
            "A quick entry point to the platform, product surface, and main workflows.",
        },
        {
          title: "Hermes Guide",
          href: "#learn-guide",
          description:
            "Best practices, concepts, and operating patterns for real deployments.",
        },
        {
          title: "Tutorials",
          href: "#learn-tutorials",
          description:
            "Hands-on walkthroughs that take you from first setup to production use cases.",
        },
      ],
      columns: [
        {
          title: "Resources",
          links: [
            { label: "Blog", href: "#blog" },
            { label: "Docs", href: "#docs" },
            { label: "Resources", href: "#resources" },
          ],
        },
      ],
    },
  },
  { href: "#news", label: "News" },
];
