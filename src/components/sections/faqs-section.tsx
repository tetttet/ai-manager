"use client";

import { Plus } from "lucide-react";
import { useId, useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "What is AI safety?",
    answer:
      "AI safety is the work of making advanced AI systems reliable, controllable, and beneficial for people.",
  },
  {
    question: "How does your AI help businesses?",
    answer:
      "It can automate workflows, answer customer questions, analyze data, and help teams work faster.",
  },
  {
    question: "Can I customize the AI for my company?",
    answer:
      "Yes. You can adapt the assistant to your company's tone, documents, processes, and product data.",
  },
  {
    question: "Is my data protected?",
    answer:
      "Security and privacy are core parts of the system. Access control and safe data handling can be built in.",
  },
  {
    question: "How do I get started?",
    answer:
      "You can start by defining your main use case, uploading company knowledge, and connecting the assistant to your tools.",
  },
];

export default function FaqsSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const faqId = useId();

  return (
    <section className="w-full bg-[#f4f2eb] px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 lg:grid-cols-[360px_1fr] lg:gap-20">
        <div>
          <h2 className="max-w-[360px] font-serif text-[30px] font-medium leading-[1.12] tracking-tight text-black sm:text-[36px] lg:text-[34px]">
            At Hermes, we build AI to serve humanity&apos;s long-term well-being.
          </h2>
        </div>

        <div>
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                className="border-b border-black/15 first:border-t"
              >
                <h3>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between gap-8 py-5 text-left text-[16px] font-medium leading-tight tracking-tight text-black transition-colors hover:text-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                    aria-expanded={isOpen}
                    aria-controls={`${faqId}-panel-${index}`}
                    onClick={() =>
                      setOpenIndex((currentIndex) =>
                        currentIndex === index ? -1 : index,
                      )
                    }
                  >
                    <span>{item.question}</span>
                    <Plus
                      aria-hidden="true"
                      className={`h-5 w-5 shrink-0 text-black/55 transition-transform duration-300 ${
                        isOpen ? "rotate-45" : "rotate-0"
                      }`}
                      strokeWidth={1.8}
                    />
                  </button>
                </h3>

                <div
                  id={`${faqId}-panel-${index}`}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="max-w-[760px] pb-6 pr-10">
                      <p className="font-serif text-[18px] leading-[1.4] tracking-tight text-[#5f5c56]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
