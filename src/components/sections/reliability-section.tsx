import React from "react";

const cards = [
  {
    title: "Enterprise-grade security",
    description:
      "SOC II certified, GDPR compliant, and penetration tested by KPMG. Your data and your customers' data are protected to the highest industry standard.",
    icon: "security",
  },
  {
    title: "Reliable infrastructure",
    description:
      "Built on AWS with automatic scaling and zero maintenance required. Botpress handles peak traffic without interruption — your team never has to think about it.",
    icon: "infrastructure",
  },
  {
    title: "AI that knows its limits",
    description:
      "Botpress agents are built with escalation rules and fallback logic that determine exactly when AI acts and when it escalates. You stay in control of the experience.",
    icon: "limits",
  },
];

const stroke = "#6f8645";

function SecurityIcon() {
  return (
    <svg
      viewBox="0 0 260 190"
      className="h-[170px] w-[260px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="55"
        y="30"
        width="72"
        height="78"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <text x="63" y="51" fill={stroke} fontSize="16" fontWeight="600">
        KPMG
      </text>

      <rect
        x="38"
        y="104"
        width="88"
        height="86"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <rect
        x="43"
        y="109"
        width="78"
        height="76"
        stroke={stroke}
        strokeWidth="1"
        strokeDasharray="1.5 2"
        opacity="0.7"
      />
      <text x="51" y="129" fill={stroke} fontSize="16" fontWeight="600">
        SOC II
      </text>

      <rect
        x="132"
        y="58"
        width="102"
        height="100"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <rect
        x="138"
        y="64"
        width="90"
        height="88"
        stroke={stroke}
        strokeWidth="1"
        strokeDasharray="1.5 2"
        opacity="0.7"
      />
      <text x="145" y="82" fill={stroke} fontSize="16" fontWeight="600">
        GDPR
      </text>
    </svg>
  );
}

function InfrastructureIcon() {
  return (
    <svg
      viewBox="0 0 260 190"
      className="h-[170px] w-[260px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M75 42H145L205 86H135L75 42Z"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path
        d="M75 42V142L135 185V86L75 42Z"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path d="M135 86H205V158H135V86Z" stroke={stroke} strokeWidth="1.5" />

      <path d="M75 70H145L205 114" stroke={stroke} strokeWidth="1.5" />
      <path d="M75 98H135" stroke={stroke} strokeWidth="1.5" />
      <path d="M135 114H205" stroke={stroke} strokeWidth="1.5" />
      <path d="M135 140H205" stroke={stroke} strokeWidth="1.5" />
      <path d="M135 158H205" stroke={stroke} strokeWidth="1.5" />

      <path d="M105 64L165 108" stroke={stroke} strokeWidth="1" opacity="0.6" />
      <path d="M75 98L135 140" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <path
        d="M135 86L205 158"
        stroke={stroke}
        strokeWidth="1"
        opacity="0.45"
      />
    </svg>
  );
}

function LimitsIcon() {
  return (
    <svg
      viewBox="0 0 260 190"
      className="h-[170px] w-[260px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="52"
        y="48"
        width="92"
        height="92"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <rect
        x="144"
        y="48"
        width="68"
        height="68"
        stroke={stroke}
        strokeWidth="1"
        strokeDasharray="1.5 2"
        opacity="0.7"
      />
      <rect
        x="52"
        y="140"
        width="144"
        height="56"
        stroke={stroke}
        strokeWidth="1"
        strokeDasharray="1.5 2"
        opacity="0.7"
      />

      <path d="M52 48L144 140" stroke={stroke} strokeWidth="1" />
      <path d="M72 68L164 160" stroke={stroke} strokeWidth="1" opacity="0.65" />
      <path d="M144 116H176V148" stroke={stroke} strokeWidth="1.5" />
      <path d="M52 140H196" stroke={stroke} strokeWidth="1.5" />
      <path d="M144 48V140" stroke={stroke} strokeWidth="1.5" />
      <path d="M52 68H144" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

function CardIcon({ type }: { type: string }) {
  if (type === "security") return <SecurityIcon />;
  if (type === "infrastructure") return <InfrastructureIcon />;
  return <LimitsIcon />;
}

export default function ReliabilitySection() {
  return (
    <section className="w-full px-5 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="mx-auto max-w-[760px] text-center text-[38px] font-medium leading-[1.2] tracking-tight text-black sm:text-[52px] lg:text-[36px] font-serif">
          Enterprise-grade reliability,
          <br />
          built over 10 years.
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-10">
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex min-h-[520px] flex-col rounded-[20px] bg-[#fbfbfa] px-6 pb-10 pt-12 shadow-none sm:px-8 lg:px-6 xl:px-8"
            >
              <div className="flex flex-1 items-start justify-center pt-4">
                <CardIcon type={card.icon} />
              </div>

              <div className="mt-auto">
                <h3 className="text-[22px] font-medium font-serif leading-tight tracking-[-0.035em] text-black sm:text-[24px]">
                  {card.title}
                </h3>

                <p className="mt-5 max-w-[390px] text-[16px] leading-[1.45] tracking-tight text-[#5f5f5f] sm:text-[16px]">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
