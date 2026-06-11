import Link from "next/link";
import { FOOTER_COLUMNS } from "@/constants/footer-navigations";
import { FooterMeta } from "../ui/footer-meta";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative mt-auto text-[#f5f1e8]"
      style={{
        background:
          "radial-gradient(circle at left 18% top 5.5rem, rgba(164, 132, 74, 0.14), transparent 16rem), radial-gradient(circle at right top, rgba(67, 91, 74, 0.12), transparent 18rem), #12110f",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.24) 52%, rgba(255,255,255,0) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-360 px-6 py-14 sm:px-8 md:py-18 lg:px-12 lg:pb-12 lg:pt-22 xl:px-16">
        <div className="grid gap-14 lg:grid-cols-[minmax(200px,1.8fr)_repeat(4,minmax(0,1fr))] lg:gap-12 xl:gap-28">
          <div className="flex flex-col gap-10 lg:min-h-150 lg:justify-between">
            <Link
              href="/"
              aria-label="Hermes home"
              className="group select-none inline-flex w-fit items-center whitespace-nowrap text-[32px] font-black uppercase leading-none text-white"
              style={{ textDecoration: "none" }}
            ></Link>

            <div className="hidden lg:block">
              <FooterMeta year={year} />
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.key} className="space-y-8">
              {column.sections.map((section) => (
                <div key={section.heading} className="space-y-2">
                  <h2 className="select-none text-[12.5px] font-semibold tracking-[-0.01em] text-white">
                    {section.heading}
                  </h2>

                  <ul className="space-y-1 ">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-[12px] text-[#aaa295] transition-colors duration-200 hover:text-white"
                          style={{ textDecoration: "none" }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}

          <div className="lg:hidden">
            <FooterMeta year={year} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
