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
  { href: "/platform", label: "Platform" },
  { href: "/about", label: "About" },
  { href: "#", label: "Documentation" },
  {
    href: "#",
    label: "Resources",
    dropdown: {
      summary:
        "How Hermes approaches safety, privacy, and long-term trust across research and deployment.",
      featured: [
        {
          title: "Enterprice",
          href: "#",
          description: "",
        },
        {
          title: "Agencies",
          href: "#",
          description: "",
        },
        {
          title: "Developers",
          href: "#",
          description: "",
        },
      ],
      columns: [
        {
          title: "Models",
          links: [
            { label: "Dublios", href: "#" },
            { label: "Hermes", href: "#" },
          ],
        },
        {
          title: "Company",
          links: [{ label: "Contact", href: "#" }],
        },
      ],
    },
  },
  {
    href: "#",
    label: "Learn",
    dropdown: {
      summary:
        "Guides, tutorials, and documentation for teams building practical systems with Hermes/AI.",
      featured: [
        {
          title: "Blog",
          href: "#",
          description: "",
        },
        {
          title: "Tutorials",
          href: "#",
          description: "",
        },
      ],
      columns: [],
    },
  },
  { href: "#", label: "Pricing" },
];
