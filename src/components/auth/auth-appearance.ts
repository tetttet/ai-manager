export const authAppearance = {
  options: {
    elevation: "flush",
  },
  variables: {
    colorPrimary: "#18181b",
    colorBackground: "#ffffff",
    colorText: "#18181b",
    colorTextSecondary: "#71717a",
  },
  elements: {
    rootBox: "shadow-none",
    card: "shadow-none border-none bg-transparent",
    main: "shadow-none",
    header: "shadow-none",
    footer: "shadow-none",

    socialButtonsBlockButton:
      "!h-11 !rounded-lg !border !border-zinc-200 !bg-white !text-zinc-900 !shadow-none hover:!bg-zinc-50",
    socialButtonsBlockButtonText: "!text-sm !font-medium !text-zinc-800",
    socialButtonsProviderIcon: "!size-4",

    dividerLine: "!bg-zinc-200",
    dividerText: "!text-zinc-500",

    formFieldLabel: "!text-sm !font-medium !text-zinc-800",
    formFieldInput:
      "!h-11 !rounded-lg !border !border-zinc-200 !bg-white !px-3 !text-sm !text-zinc-950 !shadow-none !outline-none focus:!border-zinc-950 focus:!ring-0",
    formFieldInputShowPasswordButton: "!text-zinc-500",

    formButtonPrimary:
      "!h-11 !rounded-lg !bg-zinc-950 !text-sm !font-medium !text-white !shadow-none hover:!bg-zinc-800",

    footerActionText: "!text-zinc-500",
    footerActionLink: "!font-medium !text-zinc-950 hover:!text-zinc-700",

    identityPreviewEditButton: "!text-zinc-950",
  },
};
