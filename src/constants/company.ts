export const companyContent = {
  hero: {
    title: "Making AI systems you can rely on",
    description:
      "Anthropic is an AI safety and research company. We build reliable, interpretable, and steerable AI systems.",
    cta: "Join us",
  },
  purpose: {
    heading: "Our Purpose",
    description:
      "We believe AI will have a vast impact on the world. Anthropic is dedicated to building systems that people can rely on and generating research about the opportunities and risks of AI.",
    cards: [
      {
        title: "We Build Safer Systems",
        description:
          "We aim to build frontier AI systems that are reliable, interpretable, and steerable. We conduct frontier research, develop and apply a variety of safety techniques, and deploy the resulting systems via a set of partnerships and products.",
      },
      {
        title: "Safety Is a Science",
        description:
          "We treat AI safety as a systematic science, conducting research, applying it to our products, feeding those insights back into our research, and regularly sharing what we learn with the world along the way.",
      },
      {
        title: "Interdisciplinary",
        description:
          "Anthropic is a collaborative team of researchers, engineers, policy experts, business leaders and operators, who bring our experience from many different domains to our work.",
      },
      {
        title: "AI Companies are One Piece of a Big Puzzle",
        description:
          "AI has the potential to fundamentally change how the world works. We view ourselves as just one piece of this evolving puzzle. We collaborate with civil society, government, academia, nonprofits and industry to promote safety industry-wide.",
      },
    ],
  },
  team: {
    heading: "The Team",
    description:
      "We're a team of researchers, engineers, policy experts and operational leaders, with experience spanning a variety of disciplines, all working together to build reliable and understandable AI systems.",
    cards: [
      {
        title: "Research",
        imageSrc: "/images/etc/team-research.jpg",
        imageAlt: "Research",
        description:
          "We conduct frontier AI research across a variety of modalities, and explore novel and emerging safety research areas from interpretability to RL from human feedback to policy and societal impacts analysis.",
      },
      {
        title: "Policy",
        imageSrc: "/images/etc/team-policy.jpg",
        imageAlt: "Policy",
        description:
          "We think about the impacts of our work and strive to communicate what we're seeing at the frontier to policymakers and civil society in the US and abroad to help promote safe and reliable AI.",
      },
      {
        title: "Product",
        imageSrc: "/images/etc/team-product.jpg",
        imageAlt: "Product",
        description:
          "We translate our research into tangible, practical tools like Claude that benefit businesses, nonprofits and civil society groups and their clients and people around the globe.",
      },
      {
        title: "Operations",
        imageSrc: "/images/etc/team-operations.jpg",
        imageAlt: "Operations",
        description:
          "Our people, finance, legal, and recruiting teams are the human engines that make Anthropic go. We've had previous careers at NASA, startups, and the armed forces and our diverse experiences help make Anthropic a great place to work (and we love plants!).",
      },
    ],
  },
  values: {
    heading: "What we value and how we act",
    description:
      "Every day, we make critical decisions that inform our ability to achieve our mission. Shaping the future of AI and, in turn, the future of our world is a responsibility and a privilege. Our values guide how we work together, the decisions we make, and ultimately how we show up for each other and work toward our mission.",
    cards: [
      {
        title: "Act for the global good.",
        description:
          "We believe it's crucial to maximize positive outcomes for humanity. In everything we do, we are willing to be very bold in the actions we take. We encourage our people to think long-term for good. We take seriously the task of safety, guiding the world through a technological revolution that has the potential to change the course of human history, and are committed to helping make this transition go well.",
      },
      {
        title: "Hold light and shade.",
        description:
          "AI has the potential to pose unprecedented risks to humanity if things go badly. It also has the potential to unlock unprecedented benefits for humanity if things go well. We need to hold light against the potential for bad outcomes. We need light to realize the good outcomes.",
      },
      {
        title: "Be good to our users.",
        description:
          'At Anthropic, we define "users" broadly. Users are our customers, policy-makers, Ants, and anyone impacted by the technology we build or the actions we take. We cultivate generosity and kindness in all our interactions with our users, and with the world at large. Going above and beyond for each other, our customers, and all of the specific users of our technology is meeting expectations.',
      },
      {
        title: "Ignite a race to the top on safety.",
        description:
          "As a safety-first company, we believe that building reliable, trustworthy, and steerable AI is central to taking responsibility – and the market agrees. We work to inspire a 'race to the top' on dynamic where AI developers must compete to develop the most safe and reliable AI systems. We actively drive up and constantly raise the industry bar for AI safety and security and drive others to do the same.",
      },
      {
        title: "Do the simple thing that works.",
        description:
          "We take an empirical approach to problems and care about the size of our impact and not the sophistication of our methods. This doesn't mean we throw together hacky solutions. It means we think pragmatically, work on the problem at hand, come up with a good solution and iterate from there. We don't invent a spaceship if all we need is a bicycle.",
      },
      {
        title: "Be helpful, honest, and harmless.",
        description:
          "Anthropic is a high-trust, low-ego organization. We communicate kindly and directly, assuming good intentions even in disagreement. We are thoughtful about our actions, providing honest feedback when needed. Everyone contributes, regardless of role. If something urgently needs to be done, the right person to do it is probably you!",
      },
      {
        title: "Put the mission first.",
        description:
          "At the end of the day, the mission is what we're all here for. It gives us a shared purpose and allows us to act in alignment with the mission. It engenders trust and collaboration and is the final arbiter in our decisions. When it comes to missteps and bystandards, we each take personal leadership in building our mission successful.",
      },
    ],
  },
  governance: {
    heading: "Governance",
    description: {
      prefix:
        "Anthropic is a Public Benefit Corporation, whose purpose is the responsible development and maintenance of advanced AI for the long-term benefit of humanity. Our Board of Directors is elected by stockholders and our Long-Term Benefit Trust, as explained",
      link: {
        href: "https://www.anthropic.com/news/the-long-term-benefit-trust",
        label: "here",
      },
      suffix:
        ". Current members of the Board and the Long-Term Benefit Trust (LTBT) are listed below.",
    },
    groups: [
      {
        title: "Anthropic Board of Directors",
        description:
          "Dario Amodei, Daniela Amodei, Yasmin Razavi, Reed Hastings, Chris Liddell, and Vas Natarajan.",
      },
      {
        title: "LTBT Trustees",
        description:
          "Neil Buddy Shah, Richard Fontaine, and Mariano-Florentino Cuéllar.",
      },
    ],
  },
} as const;
