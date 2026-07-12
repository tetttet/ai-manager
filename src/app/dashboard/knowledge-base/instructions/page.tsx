import {
  CheckCircle2,
  Database,
  FileText,
  Globe2,
  ImageIcon,
  ListChecks,
  Table2,
  Type,
} from "lucide-react";

const sourceTypes = [
  {
    title: "Website",
    description:
      "Use this for public pages, docs and help centers. Add the exact URL and check that the detected domain is correct before saving.",
    icon: Globe2,
  },
  {
    title: "Document",
    description:
      "Use this for PDF, DOCX, TXT, CSV, JSON or HTML files. Use Tables for XLS or XLSX files so agents can read rows correctly.",
    icon: FileText,
  },
  {
    title: "Table",
    description:
      "Use this for structured lookups such as prices, product lists, schedules, rules or comparison data.",
    icon: Table2,
  },
  {
    title: "Text Input",
    description:
      "Use this for short policies, answers, scripts, hand-written notes and small pieces of reusable knowledge.",
    icon: Type,
  },
];

const steps = [
  "Open General and create a separate Knowledge Base for one clear topic or workflow.",
  "Use a short, specific name, for example Support FAQ, Pricing Rules or Product Catalog.",
  "Add sources by choosing Website, Document, Table or Text Input. Do not mix unrelated topics in one source.",
  "Choose the source mode by importance. Use extra high only for information the agent must prioritize.",
  "Save the source, then quickly review the row in the source table to confirm the name, type and status.",
  "Update or delete stale sources instead of adding duplicates. The newest, cleanest source should be the one agents rely on.",
];

const screenshotSlots = [
  "Screenshot: Knowledge Base list and New Knowledge Base button",
  "Screenshot: source type buttons",
  "Screenshot: source editor form",
  "Screenshot: saved source table",
];

export default function KnowledgeBaseInstructionsPage() {
  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-lg border bg-white shadow-sm">
      <header className="border-b px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
            <Database className="size-5 text-zinc-700" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Knowledge Base Instructions
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal">
              How to add Knowledge Base correctly
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Keep each knowledge base focused, use the right source type and
              keep outdated information out of the agent context.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-5 border-b px-5 py-5 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="size-4 text-zinc-600" />
            <h2 className="text-sm font-semibold tracking-normal">
              Recommended flow
            </h2>
          </div>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-zinc-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-md border bg-muted/30 p-4">
          <h2 className="text-sm font-semibold tracking-normal">
            Quick checklist
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700">
            {[
              "One knowledge base has one topic.",
              "Each source has a clear name.",
              "Important sources use the correct mode.",
              "Old or duplicate sources are removed.",
              "Tables are used for structured facts.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b px-5 py-5 sm:px-6">
        <h2 className="text-sm font-semibold tracking-normal">
          Source types
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {sourceTypes.map((sourceType) => (
            <div key={sourceType.title} className="rounded-md border p-4">
              <div className="flex items-center gap-2">
                <sourceType.icon className="size-4 text-zinc-600" />
                <h3 className="text-sm font-semibold">{sourceType.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {sourceType.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-5 sm:px-6">
        <h2 className="text-sm font-semibold tracking-normal">
          Screenshot placeholders
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {screenshotSlots.map((slot) => (
            <div
              key={slot}
              className="flex min-h-44 items-center justify-center rounded-md border border-dashed bg-muted/20 p-4 text-center"
            >
              <div>
                <ImageIcon className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-zinc-700">{slot}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Replace this placeholder with an MDX image or screenshot.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
