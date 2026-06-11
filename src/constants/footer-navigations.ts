type FooterLink = {
  href: string;
  label: string;
};

type FooterSection = {
  heading: string;
  links: FooterLink[];
};

type FooterColumn = {
  key: string;
  sections: FooterSection[];
};

const toHref = (label: string) =>
  `#${label
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

const makeLinks = (labels: string[]): FooterLink[] =>
  labels.map((label) => ({
    href: toHref(label),
    label,
  }));

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    key: "products",
    sections: [
      {
        heading: "Products",
        links: makeLinks([
          "Hermes Assistant",
          "Hermes Agents",
          "Hermes Enterprise",
          "Team workspace",
          "Browser extension",
          "Slack integration",
          "Desktop app",
          "Pricing",
          "Sign in",
        ]),
      },
      {
        heading: "Models",
        links: makeLinks([
          "Hermes Reasoning",
          "Hermes Vision",
          "Hermes Realtime",
          "Hermes Mini",
        ]),
      },
    ],
  },
  {
    key: "solutions",
    sections: [
      {
        heading: "Solutions",
        links: makeLinks([
          "AI agents",
          "Automation",
          "Research workflows",
          "Customer support",
          "Education",
          "Financial services",
          "Healthcare",
          "Security",
          "Startups",
        ]),
      },
      {
        heading: "Platform",
        links: makeLinks([
          "Overview",
          "Developer docs",
          "API pricing",
          "Marketplace",
          "Regional compliance",
          "Cloud deployments",
          "Console login",
        ]),
      },
    ],
  },
  {
    key: "resources",
    sections: [
      {
        heading: "Resources",
        links: makeLinks([
          "Blog",
          "Community",
          "Connectors",
          "Courses",
          "Customer stories",
          "Engineering",
          "Events",
          "Plugins",
          "Tutorials",
          "Use cases",
        ]),
      },
      {
        heading: "Help and security",
        links: makeLinks(["Availability", "Status", "Support center"]),
      },
    ],
  },
  {
    key: "company",
    sections: [
      {
        heading: "Company",
        links: makeLinks([
          "About Hermes",
          "Careers",
          "Research",
          "News",
          "Trust center",
          "Security and compliance",
          "Transparency",
        ]),
      },
      {
        heading: "Terms and policies",
        links: makeLinks([
          "Privacy choices",
          "Privacy policy",
          "Consumer data policy",
          "Responsible disclosure",
          "Commercial terms",
          "Usage policy",
        ]),
      },
    ],
  },
];