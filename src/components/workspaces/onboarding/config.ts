import { Building2, UserRound } from "lucide-react";

import type {
  BusinessTypeChoice,
  Choice,
  WizardState,
  WizardStep,
} from "@/components/workspaces/onboarding/types";

export const initialWorkspaceWizardState: WizardState = {
  name: "",
  businessType: "individual",
  source: "other",
  profile: {
    goals: [],
    useCases: [],
    channels: [],
    currentTools: [],
    dataTypes: [],
    painPoints: [],
    role: "",
    teamSize: "",
    dataVolume: "",
    launchTimeline: "",
    successMetric: "",
    sourceDetail: "",
    notes: "",
  },
};

export const wizardSteps = [
  {
    id: "identity",
    label: "Basics",
    title: "Name it",
    description: "Workspace name and type.",
  },
  {
    id: "team",
    label: "Team",
    title: "Who is building?",
    description: "Role and team size.",
  },
  {
    id: "outcomes",
    label: "Goals",
    title: "Pick the job",
    description: "Choose what AI should handle first.",
  },
  {
    id: "connections",
    label: "Channels",
    title: "Where it lives",
    description: "Channels and current tools.",
  },
  {
    id: "data",
    label: "Data",
    title: "How much data?",
    description: "Pick the closest shape.",
  },
  {
    id: "launch",
    label: "Launch",
    title: "Ready to go",
    description: "One last pass before creation.",
  },
] as const satisfies readonly WizardStep[];

export const businessTypes: BusinessTypeChoice[] = [
  {
    value: "individual",
    label: "Individual",
    description: "Personal workflows, solo projects, testing.",
    icon: UserRound,
  },
  {
    value: "company",
    label: "Company",
    description: "Team knowledge, customers, operations.",
    icon: Building2,
  },
];

export const roleOptions: Choice[] = [
  { label: "Founder", value: "founder" },
  { label: "Operations", value: "operations" },
  { label: "Support", value: "support" },
  { label: "Sales", value: "sales" },
  { label: "Product", value: "product" },
  { label: "Other", value: "other" },
];

export const teamSizes: Choice[] = [
  { label: "Solo", value: "solo" },
  { label: "2-5", value: "2_5" },
  { label: "6-20", value: "6_20" },
  { label: "21-100", value: "21_100" },
  { label: "100+", value: "100_plus" },
];

export const goals: Choice[] = [
  { label: "Customer support", value: "customer_support" },
  { label: "Sales assistant", value: "sales_assistant" },
  { label: "Lead qualification", value: "lead_qualification" },
  { label: "Internal knowledge", value: "internal_knowledge" },
  { label: "Workflow automation", value: "workflow_automation" },
];

export const useCases: Choice[] = [
  { label: "FAQ bot", value: "faq_bot" },
  { label: "Telegram bot", value: "telegram_bot" },
  { label: "Website chat", value: "website_chat" },
  { label: "Knowledge search", value: "knowledge_search" },
  { label: "Document answers", value: "document_answers" },
];

export const painPoints: Choice[] = [
  { label: "Slow replies", value: "slow_replies" },
  { label: "Repeated questions", value: "repeated_questions" },
  { label: "Scattered docs", value: "scattered_docs" },
  { label: "Manual routing", value: "manual_routing" },
  { label: "Bad lead quality", value: "bad_lead_quality" },
  { label: "No analytics", value: "no_analytics" },
  { label: "Hard integrations", value: "hard_integrations" },
  { label: "No clear owner", value: "no_clear_owner" },
];

export const channels: Choice[] = [
  { label: "Website", value: "website" },
  { label: "Telegram", value: "telegram" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Instagram", value: "instagram" },
  { label: "Email", value: "email" },
];

export const currentTools: Choice[] = [
  { label: "Google Drive", value: "google_drive" },
  { label: "Notion", value: "notion" },
  { label: "Sheets", value: "sheets" },
  { label: "PDF/documents", value: "documents" },
  { label: "Nothing yet", value: "none" },
];

export const dataTypes: Choice[] = [
  { label: "Website pages", value: "website_pages" },
  { label: "PDF files", value: "pdf_files" },
  { label: "Spreadsheets", value: "spreadsheets" },
  { label: "Product catalog", value: "product_catalog" },
  { label: "CRM records", value: "crm_records" },
  { label: "Policies", value: "policies" },
  { label: "Support tickets", value: "support_tickets" },
  { label: "API data", value: "api_data" },
];

export const dataVolumes: Choice[] = [
  { label: "Small and clean", value: "small_clean" },
  { label: "A few messy sources", value: "messy_sources" },
  { label: "Large knowledge base", value: "large_knowledge_base" },
  { label: "Live database/API", value: "live_database_api" },
  { label: "Not sure", value: "not_sure" },
];

export const launchTimelines: Choice[] = [
  { label: "This week", value: "this_week" },
  { label: "This month", value: "this_month" },
  { label: "This quarter", value: "this_quarter" },
  { label: "Exploring", value: "exploring" },
];

export const sourceOptions: Choice[] = [
  { label: "Google search", value: "google" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Friend or colleague", value: "friend" },
  { label: "Ad", value: "ads" },
  { label: "Other", value: "other" },
];
