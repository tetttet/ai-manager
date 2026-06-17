import { CREATOR_LINKEDIN_URL, SOCIAL_LINKS } from "@/constants/socials-url";
import { SocialIcon } from "@/icons/icon-social";
import Link from "next/link";

export function FooterMeta({ year }: { year: number }) {
  return (
    <div className="space-y-3">
      <p className="max-w-120 text-[12px] text-[#a39b8f]">
        © {year} Dublios. All rights reserved.
        <br />
        Built by{" "}
        <Link
          href={CREATOR_LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white font-semibold transition-colors duration-200"
        >
          TURAN-YAHYA GAZIZULY
        </Link>
        .
      </p>

      <div className="flex flex-wrap items-center gap-1">
        {SOCIAL_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            aria-label={link.label}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={
              link.href.startsWith("http") ? "noopener noreferrer" : undefined
            }
            className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/3 text-[#f5f1e8] transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/8 hover:shadow-[0_18px_38px_rgba(0,0,0,0.28)]"
            style={{ textDecoration: "none" }}
          >
            <SocialIcon kind={link.kind} />
          </Link>
        ))}
      </div>
    </div>
  );
}
