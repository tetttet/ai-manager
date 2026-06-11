export const plans = (tab: "individual" | "team") =>
  tab === "individual"
    ? [
        {
          name: "Free",
          subtitle: "Meet Claude",
          monthlyPrice: 0,
          features: [
            "Chat on web, iOS, Android, and desktop",
            "Generate code and visualize data",
            "Connect Slack and Google Workspace",
            "Extended thinking for complex work",
            "Built-in web search",
          ],
          button: "Use Claude for free",
        },
        {
          name: "Pro",
          subtitle: "Research, code, and organize",
          monthlyPrice: 20,
          features: [
            "Everything in Free and:",
            "Claude Code directly in your codebase",
            "Power through tasks with Cowork",
            "Higher usage limits",
            "Deep research and analysis",
            "Memory that carries across conversations",
          ],
          button: "Get Pro plan",
        },
        {
          name: "Max",
          subtitle: "Higher limits, priority access",
          monthlyPrice: 100,
          features: [
            "Everything in Pro, plus:",
            "Up to 20x more usage than Pro",
            "Recommended for Claude Code & Cowork",
            "Early access to advanced features",
            "Higher output limits for all tasks",
            "Priority access at high traffic times",
          ],
          button: "Get Max plan",
        },
      ]
    : [
        {
          name: "Team",
          subtitle: "For growing companies",
          monthlyPrice: 30,
          features: [
            "Shared workspace",
            "Team knowledge",
            "Role management",
            "Priority support",
            "Advanced collaboration",
          ],
          button: "Get Team plan",
        },
        {
          name: "Business",
          subtitle: "Scale with confidence",
          monthlyPrice: 75,
          features: [
            "Everything in Team",
            "Advanced analytics",
            "Workflow automation",
            "Private deployments",
            "Enhanced security",
          ],
          button: "Get Business plan",
        },
        {
          name: "Enterprise",
          subtitle: "Custom solutions",
          monthlyPrice: 200,
          features: [
            "Custom integrations",
            "Dedicated success manager",
            "Enterprise-grade security",
            "SSO & SCIM",
            "Custom SLAs",
          ],
          button: "Contact sales",
        },
      ];
