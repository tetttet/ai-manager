"use client";

import { aboutSections as sections } from "@/lib/about-content";
import { ArrowUp, Download } from "lucide-react";
import React, { MouseEvent, useEffect, useState } from "react";

const getScrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

const Page = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frameId: number | null = null;

    const syncBackToTop = () => {
      const nextShowBackToTop = window.scrollY > 420;
      setShowBackToTop((current) =>
        current === nextShowBackToTop ? current : nextShowBackToTop,
      );
      frameId = null;
    };

    const scheduleSync = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(syncBackToTop);
    };

    scheduleSync();
    window.addEventListener("scroll", scheduleSync, { passive: true });

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", scheduleSync);
    };
  }, []);

  const handleTopicClick = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    event.preventDefault();

    const element = document.getElementById(sectionId);
    if (!element) return;

    element.scrollIntoView({
      behavior: getScrollBehavior(),
      block: "start",
    });
    setActiveSection(sectionId);
    window.history.replaceState(null, "", `#${sectionId}`);
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: getScrollBehavior(),
    });
    setActiveSection(sections[0].id);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  };

  return (
    <main className="min-h-screen bg-[#f8f6ef] text-[#171717]">
      <div className="mx-auto grid max-w-365 grid-cols-1 gap-10 px-6 py-12 md:grid-cols-[240px_1fr] md:px-10 lg:gap-28 lg:pb-24 lg:pt-12">
        {/* Left menu */}
        <aside className="hidden md:block">
          <nav className="sticky top-20">
            {sections.map((section) => {
              const isActive = activeSection === section.id;

              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(event) => handleTopicClick(event, section.id)}
                  className={`block border-b border-[#d8d4c9] py-3 text-[14px] leading-tight transition-colors ${
                    isActive
                      ? "font-medium text-[#111111]"
                      : "text-[#8a877f] hover:text-[#111111]"
                  }`}
                >
                  {section.menuTitle}
                </a>
              );
            })}

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="/about/download/pdf"
                download
                className="inline-flex w-full items-center justify-between gap-2 rounded-[12px] bg-black px-5 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-[background-color,transform] duration-200 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                style={{ textDecoration: "none" }}
              >
                <span>Download PDF</span>
                <Download aria-hidden="true" className="h-4 w-4" />
              </a>

              <a
                href="/about/download/epub"
                download
                className="inline-flex w-full items-center justify-between gap-2 rounded-[12px] border border-black/10 bg-transparent px-5 py-2.5 text-[14px] font-medium tracking-[0.01em] text-black transition-[background-color,border-color,transform] duration-200 hover:border-black/18 hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
                style={{ textDecoration: "none" }}
              >
                <span>Download ePub</span>
                <Download aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </nav>
        </aside>

        {/* Right content */}
        <section className="max-w-190">
          <h1 className="mb-6 text-[32px] font-semibold tracking-[-0.04em] md:text-[32px]">
            Overview
          </h1>

          <div className="space-y-8">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-20"
              >
                <h2 className="mb-2 text-[25px] font-semibold tracking-[-0.035em] md:text-[24px]">
                  {section.heading}
                </h2>

                <div className="space-y-2 font-serif text-[17px] leading-[1.35] tracking-[-0.015em] text-[#171717] md:text-[18px]">
                  {section.text.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <button
        type="button"
        aria-label="Scroll to top"
        onClick={handleBackToTop}
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#171717] text-[#f8f6ef] shadow-lg transition-all duration-300 hover:bg-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/30 ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <ArrowUp aria-hidden="true" className="h-5 w-5" />
      </button>
    </main>
  );
};

export default Page;
