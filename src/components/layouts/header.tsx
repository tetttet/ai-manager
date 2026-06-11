"use client";

import {
  navigation,
  type NavItem,
  type NavLink,
} from "@/constants/header-navigations";
import { IconChevron } from "@/icons/icon-chevron";
import { IconClose } from "@/icons/icon-close";
import { IconMenu } from "@/icons/icon-menu";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import IconRightTop from "@/icons/icon-right-top";

const MOBILE_MENU_ID = "header-mobile-menu";
const HEADER_MIN_HEIGHT_REM = 4.5;
const HEADER_VERTICAL_PADDING_REM = 1;
const MOBILE_SCROLL_THRESHOLD = 8;
const HEADER_BACKGROUND = "#f4f2eb";
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

type MobileMenuSection = {
  links: NavLink[];
  title: string;
};

type DesktopDropdownSection = {
  links: NavLink[];
  title: string;
};

const getMenuId = (label: string, variant: "desktop" | "mobile") =>
  `header-menu-${variant}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const hasDropdown = (
  item: NavItem,
): item is NavItem & { dropdown: NonNullable<NavItem["dropdown"]> } =>
  Boolean(item.dropdown);

const findDropdownItem = (label: string | null) =>
  navigation.find(
    (item): item is NavItem & { dropdown: NonNullable<NavItem["dropdown"]> } =>
      item.label === label && hasDropdown(item),
  ) ?? null;

const getMobileDropdownSections = (item: NavItem): MobileMenuSection[] => {
  if (!item.dropdown) {
    return [];
  }

  return [
    {
      title: "Featured",
      links: item.dropdown.featured.map((feature) => ({
        href: feature.href,
        label: feature.title,
      })),
    },
    ...item.dropdown.columns,
  ];
};

const getDesktopDropdownSections = (
  item: NavItem,
): DesktopDropdownSection[] => {
  if (!item.dropdown) {
    return [];
  }

  const featuredLinks = item.dropdown.featured.map((feature) => ({
    href: feature.href,
    label: feature.title,
  }));

  return [
    ...(featuredLinks.length
      ? [
          {
            title: "Featured",
            links: featuredLinks,
          },
        ]
      : []),
    ...item.dropdown.columns,
  ];
};

function MobileSubmenuLink({
  emphasized = false,
  href,
  label,
  onClick,
}: {
  emphasized?: boolean;
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        emphasized
          ? "group flex items-center justify-between border-b border-black/[0.08] py-4 text-[17px] font-medium leading-none tracking-[-0.035em] text-black transition-colors duration-300 hover:text-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
          : "group flex items-center justify-between py-2.5 text-[15px] font-medium leading-none tracking-[-0.025em] text-black/62 transition-colors duration-300 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
      }
      style={{ textDecoration: "none" }}
    >
      <span>{label}</span>

      <span
        className={
          emphasized
            ? "text-black/36 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            : "text-black/22 transition-transform duration-300 group-hover:translate-x-0.5"
        }
      >
        {emphasized ? <IconRightTop /> : "→"}
      </span>
    </Link>
  );
}

/* ─── Main Header ────────────────────────────────────────────────── */
const Header = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [desktopMenuLabel, setDesktopMenuLabel] = useState<string | null>(null);
  const [desktopContentVisible, setDesktopContentVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mobileScrolled, setMobileScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const headerRef = useRef<HTMLElement | null>(null);
  const desktopMenuTimeoutRef = useRef<number | null>(null);
  const desktopContentFrameRef = useRef<number | null>(null);

  const activeDesktopItem = isDesktop ? findDropdownItem(activeMenu) : null;
  const renderedDesktopItem = isDesktop
    ? findDropdownItem(desktopMenuLabel)
    : null;

  const desktopDropdownOpen = Boolean(activeDesktopItem);

  const desktopDropdownId = renderedDesktopItem
    ? getMenuId(renderedDesktopItem.label, "desktop")
    : undefined;

  const desktopSections = renderedDesktopItem
    ? getDesktopDropdownSections(renderedDesktopItem)
    : [];

  const clearDesktopMenuTimeout = () => {
    if (desktopMenuTimeoutRef.current !== null) {
      window.clearTimeout(desktopMenuTimeoutRef.current);
      desktopMenuTimeoutRef.current = null;
    }
  };

  const clearDesktopContentFrame = () => {
    if (desktopContentFrameRef.current !== null) {
      window.cancelAnimationFrame(desktopContentFrameRef.current);
      desktopContentFrameRef.current = null;
    }
  };

  const queueDesktopContentReveal = () => {
    clearDesktopContentFrame();

    desktopContentFrameRef.current = window.requestAnimationFrame(() => {
      desktopContentFrameRef.current = window.requestAnimationFrame(() => {
        setDesktopContentVisible(true);
        desktopContentFrameRef.current = null;
      });
    });
  };

  useEffect(
    () => () => {
      clearDesktopMenuTimeout();
      clearDesktopContentFrame();
    },
    [],
  );

  useEffect(() => {
    let frameId: number | null = null;
    const desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    const handlePointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        clearDesktopMenuTimeout();
        clearDesktopContentFrame();
        setActiveMenu(null);
        setDesktopMenuLabel(null);
        setDesktopContentVisible(false);
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearDesktopMenuTimeout();
        clearDesktopContentFrame();
        setActiveMenu(null);
        setDesktopMenuLabel(null);
        setDesktopContentVisible(false);
        setMobileMenuOpen(false);
      }
    };

    const syncScrollState = () => {
      if (desktopQuery.matches) {
        const next = Math.min(window.scrollY / 140, 1);

        setScrollProgress((current) =>
          Math.abs(current - next) < 0.01 ? current : next,
        );

        setMobileScrolled((current) => (current ? false : current));
        return;
      }

      setScrollProgress((current) => (current === 0 ? current : 0));

      setMobileScrolled((current) => {
        const next = window.scrollY > MOBILE_SCROLL_THRESHOLD;
        return current === next ? current : next;
      });
    };

    const scheduleSync = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        setIsDesktop(desktopQuery.matches);
        syncScrollState();
        frameId = null;
      });
    };

    const handleScroll = () => {
      scheduleSync();
    };

    const handleDesktopChange = () => {
      clearDesktopMenuTimeout();
      clearDesktopContentFrame();
      setActiveMenu(null);
      setDesktopMenuLabel(null);
      setDesktopContentVisible(false);
      setMobileMenuOpen(false);
      scheduleSync();
    };

    scheduleSync();

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, { passive: true });
    desktopQuery.addEventListener("change", handleDesktopChange);

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);

      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll);
      desktopQuery.removeEventListener("change", handleDesktopChange);
    };
  }, []);

  useEffect(() => {
    const { style } = document.body;
    const previousOverflow = style.overflow;

    style.overflow = mobileMenuOpen ? "hidden" : previousOverflow;

    return () => {
      style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const openDesktopMenu = (label: string) => {
    const alreadyVisible =
      activeMenu === label &&
      desktopMenuLabel === label &&
      desktopContentVisible;

    clearDesktopMenuTimeout();
    setActiveMenu(label);
    setDesktopMenuLabel(label);

    if (alreadyVisible) {
      return;
    }

    setDesktopContentVisible(false);
    queueDesktopContentReveal();
  };

  const closeDesktopMenu = () => {
    clearDesktopMenuTimeout();
    clearDesktopContentFrame();

    setActiveMenu(null);
    setDesktopContentVisible(false);

    if (!isDesktop) {
      setDesktopMenuLabel(null);
      return;
    }

    desktopMenuTimeoutRef.current = window.setTimeout(() => {
      setDesktopMenuLabel(null);
      desktopMenuTimeoutRef.current = null;
    }, 280);
  };

  const toggleMenu = (label: string) => {
    if (!isDesktop) {
      setActiveMenu((current) => (current === label ? null : label));
      return;
    }

    if (activeMenu === label) {
      closeDesktopMenu();
      return;
    }

    openDesktopMenu(label);
  };

  const closeMenus = () => {
    clearDesktopMenuTimeout();
    clearDesktopContentFrame();

    setActiveMenu(null);
    setDesktopMenuLabel(null);
    setDesktopContentVisible(false);
    setMobileMenuOpen(false);
  };

  const easedScrollProgress = 1 - Math.pow(1 - scrollProgress, 3);
  const logoProgress = isDesktop ? easedScrollProgress : 0;

  const mobileHeaderOffset =
    HEADER_MIN_HEIGHT_REM + HEADER_VERTICAL_PADDING_REM * 2;

  const headerRaised = mobileMenuOpen || mobileScrolled || desktopDropdownOpen;

  const getMobileItemMotion = (index: number) => ({
    opacity: mobileMenuOpen ? 1 : 0,
    transform: mobileMenuOpen ? "translateY(0px)" : "translateY(18px)",
    transition: `opacity 0.36s cubic-bezier(0.16,1,0.3,1) ${
      100 + index * 34
    }ms, transform 0.56s cubic-bezier(0.16,1,0.3,1) ${100 + index * 34}ms`,
  });

  const getDesktopSectionMotion = (index: number) => ({
    opacity: desktopContentVisible ? 1 : 0,
    transform: desktopContentVisible ? "translateY(0px)" : "translateY(-18px)",
    transition: `opacity 0.38s cubic-bezier(0.16,1,0.3,1) ${
      80 + index * 45
    }ms, transform 0.58s cubic-bezier(0.16,1,0.3,1) ${80 + index * 45}ms`,
  });

  const getDesktopLinkMotion = (sectionIndex: number, linkIndex: number) => {
    const delay = 125 + sectionIndex * 45 + linkIndex * 30;

    return {
      opacity: desktopContentVisible ? 1 : 0,
      transform: desktopContentVisible
        ? "translateY(0px)"
        : "translateY(-14px)",
      transition: `opacity 0.42s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.62s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    };
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 overflow-visible text-black"
      onMouseLeave={() => {
        if (isDesktop) {
          closeDesktopMenu();
        }
      }}
      style={{
        backgroundColor: HEADER_BACKGROUND,
        boxShadow: headerRaised ? "inset 0 -1px 0 rgba(15,23,42,0.08)" : "none",
      }}
    >
      {/* ── Top bar ── */}
      <div
        className="mx-auto flex max-w-360 items-center justify-between gap-6 px-5 sm:px-8 lg:px-12"
        style={{
          minHeight: `${HEADER_MIN_HEIGHT_REM}rem`,
          paddingTop: `${HEADER_VERTICAL_PADDING_REM}rem`,
          paddingBottom: `${HEADER_VERTICAL_PADDING_REM}rem`,
          position: "relative",
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Hermes/AI"
          onMouseEnter={closeDesktopMenu}
          className="shrink-0 rounded-md text-[22px] font-black uppercase tracking-tight text-black outline-none focus-visible:ring-2 focus-visible:ring-black/15"
          style={{ textDecoration: "none" }}
        >
          AI Manager
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navigation.map((item) => {
            const isOpen = activeMenu === item.label;

            if (!item.dropdown) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={closeDesktopMenu}
                  onClick={closeDesktopMenu}
                  className="rounded-full px-1 py-1 text-[14.5px] font-medium text-black/70 transition-colors duration-200 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                  style={{ textDecoration: "none" }}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                className="flex items-center gap-1.5 rounded-full px-1 py-1 text-[14.5px] font-medium text-black/70 transition-colors duration-200 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls={getMenuId(item.label, "desktop")}
                onMouseEnter={() => openDesktopMenu(item.label)}
                onFocus={() => openDesktopMenu(item.label)}
                onClick={() => toggleMenu(item.label)}
              >
                {item.label}
                <IconChevron open={isOpen} />
              </button>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div
          className="hidden items-center gap-3 lg:flex"
          onMouseEnter={closeDesktopMenu}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-[12px] bg-black px-5.5 py-2.5 text-[14px] font-medium tracking-[0.01em] text-white transition-[background-color,transform] duration-200 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            style={{ textDecoration: "none" }}
          >
            Try Hermes
            <IconRightTop />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls={MOBILE_MENU_ID}
          onClick={() => {
            setActiveMenu(null);
            setMobileMenuOpen((current) => !current);
          }}
          className="relative inline-flex items-center justify-center rounded-xl outline-none transition-colors duration-200 hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black/15 lg:hidden"
          style={{
            width: "40px",
            height: "40px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#000",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              transition:
                "opacity 0.22s cubic-bezier(0.16,1,0.3,1), transform 0.22s cubic-bezier(0.16,1,0.3,1)",
              opacity: mobileMenuOpen ? 0 : 1,
              transform: mobileMenuOpen
                ? "rotate(90deg) scale(0.72)"
                : "rotate(0deg) scale(1)",
              position: "absolute",
            }}
          >
            <IconMenu />
          </span>

          <span
            style={{
              display: "inline-flex",
              transition:
                "opacity 0.22s cubic-bezier(0.16,1,0.3,1), transform 0.22s cubic-bezier(0.16,1,0.3,1)",
              opacity: mobileMenuOpen ? 1 : 0,
              transform: mobileMenuOpen
                ? "rotate(0deg) scale(1)"
                : "rotate(-90deg) scale(0.72)",
              position: "absolute",
            }}
          >
            <IconClose />
          </span>
        </button>
      </div>

      {/* ── Desktop mega menu ─────────────────────────────────────── */}
      <div
        id={desktopDropdownId}
        aria-hidden={!desktopDropdownOpen}
        className="pointer-events-none absolute inset-x-0 top-full hidden lg:block"
        style={{
          opacity: desktopDropdownOpen ? 1 : 0,
          transform: `translateY(${desktopDropdownOpen ? "0px" : "-10px"})`,
          transition:
            "opacity 0.28s cubic-bezier(0.16,1,0.3,1), transform 0.28s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {renderedDesktopItem ? (
          <div
            className="pointer-events-auto bg-[#f4f2eb] shadow-[0_26px_56px_rgba(15,23,42,0.08)]"
            aria-label={renderedDesktopItem.label}
            role="menu"
            style={{
              overflow: "hidden",
              clipPath: desktopDropdownOpen
                ? "inset(0% 0% 0% 0%)"
                : "inset(0% 0% 100% 0%)",
              transformOrigin: "top center",
              transition:
                "clip-path 0.48s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div
              key={renderedDesktopItem.label}
              className="mx-auto max-w-360 px-5 py-6 sm:px-8 lg:px-12 xl:py-7"
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-10">
                <div
                  className="min-w-0 max-w-[320px]"
                  style={getDesktopSectionMotion(0)}
                >
                  <p className="text-[16px] font-medium leading-none tracking-[-0.025em] text-[#111111]">
                    {renderedDesktopItem.label}
                  </p>

                  <p className="mt-3 font-serif text-[18px] leading-[1.35] tracking-[-0.02em] text-[#5f5c56]">
                    {renderedDesktopItem.dropdown.summary}
                  </p>
                </div>

                <div
                  className={`grid gap-x-8 gap-y-7 ${
                    desktopSections.length > 2
                      ? "md:grid-cols-3"
                      : "md:grid-cols-2"
                  }`}
                >
                  {desktopSections.map((section, sectionIndex) => (
                    <div
                      key={section.title}
                      className="min-w-0"
                      style={getDesktopSectionMotion(sectionIndex + 1)}
                    >
                      <p className="text-[13px] font-medium leading-none tracking-[-0.02em] text-[#6f6d68]">
                        {section.title}
                      </p>

                      <div className="mt-2.5 flex flex-col">
                        {section.links.map((link, linkIndex) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            onClick={closeDesktopMenu}
                            role="menuitem"
                            className="group inline-flex items-center justify-between gap-4 border-b border-[#e0dfdc] py-2.5 text-[16px] font-medium leading-none tracking-[-0.025em] text-[#111111] transition-[color,border-color,transform] duration-300 hover:border-black/20 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                            style={{
                              textDecoration: "none",
                              ...getDesktopLinkMotion(
                                sectionIndex + 1,
                                linkIndex,
                              ),
                            }}
                          >
                            <span>{link.label}</span>

                            <span className="text-[14px] text-[#6f6d68] transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:text-black/44">
                              <IconRightTop />
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────── */}
      <div
        id={MOBILE_MENU_ID}
        className="lg:hidden"
        aria-hidden={!mobileMenuOpen}
        onClick={closeMenus}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 20,
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? "auto" : "none",
          visibility: mobileMenuOpen ? "visible" : "hidden",
          transition:
            "opacity 0.24s cubic-bezier(0.16,1,0.3,1), visibility 0.24s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: HEADER_BACKGROUND,
            clipPath: mobileMenuOpen
              ? "inset(0% 0% 0% 0%)"
              : "inset(0% 0% 100% 0%)",
            transition: "clip-path 0.58s cubic-bezier(0.16,1,0.3,1)",
          }}
        />

        <div
          onClick={(event) => event.stopPropagation()}
          style={{
            position: "relative",
            height: mobileMenuOpen ? "100dvh" : "0px",
            overflowY: mobileMenuOpen ? "auto" : "hidden",
            overscrollBehavior: "contain",
            padding: mobileMenuOpen
              ? `calc(${mobileHeaderOffset}rem + 8px) 20px max(26px, env(safe-area-inset-bottom))`
              : "0 20px",
            transition:
              "height 0.58s cubic-bezier(0.16,1,0.3,1), padding 0.24s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <nav
            className="mx-auto flex min-h-full max-w-[560px] flex-col"
            aria-label="Mobile primary"
            style={{
              opacity: mobileMenuOpen ? 1 : 0,
              transform: mobileMenuOpen
                ? "translateY(0px)"
                : "translateY(10px)",
              transition:
                "opacity 0.32s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.48s cubic-bezier(0.16,1,0.3,1) 0.1s",
            }}
          >
            <div className="pb-6" style={getMobileItemMotion(0)}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/34">
                Menu
              </p>

              <p className="mt-3 max-w-[340px] font-serif text-[28px] leading-[1.04] tracking-[-0.055em] text-black">
                Navigate Hermes with clarity.
              </p>
            </div>

            <div className="border-t border-black/[0.08]">
              {navigation.map((item, idx) => {
                const isOpen = activeMenu === item.label;
                const mobileSections = getMobileDropdownSections(item);

                const mobilePanelMaxHeight =
                  210 +
                  mobileSections.reduce(
                    (total, section) => total + section.links.length,
                    0,
                  ) *
                    46;

                if (!item.dropdown) {
                  return (
                    <div
                      key={item.label}
                      className="border-b border-black/[0.08]"
                      style={getMobileItemMotion(idx + 1)}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenus}
                        className="group flex items-center justify-between py-5 text-[30px] font-medium leading-none tracking-tight text-black transition-colors duration-300 hover:text-black/68 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                        style={{ textDecoration: "none" }}
                      >
                        <span>{item.label}</span>

                        <span className="text-[15px] text-black/34 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          <IconRightTop />
                        </span>
                      </Link>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="border-b border-black/[0.08]"
                    style={getMobileItemMotion(idx + 1)}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={getMenuId(item.label, "mobile")}
                      onClick={() => toggleMenu(item.label)}
                      className="flex w-full items-center justify-between py-5 text-left text-[30px] font-medium leading-none tracking-tight text-black transition-colors duration-300 hover:text-black/68 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                    >
                      <span>{item.label}</span>

                      <span
                        className={`flex items-center justify-center text-black/44 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      >
                        <IconChevron open={isOpen} />
                      </span>
                    </button>

                    <div
                      id={getMenuId(item.label, "mobile")}
                      style={{
                        overflow: "hidden",
                        maxHeight: isOpen ? `${mobilePanelMaxHeight}px` : "0px",
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen
                          ? "translateY(0px)"
                          : "translateY(-8px)",
                        transition:
                          "max-height 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.28s cubic-bezier(0.16,1,0.3,1), transform 0.36s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    >
                      <div className="pb-6">
                        {hasDropdown(item) ? (
                          <p className="max-w-[390px] pb-3 font-serif text-[16px] leading-[1.38] tracking-[-0.025em] text-black/50">
                            {item.dropdown.summary}
                          </p>
                        ) : null}

                        <MobileSubmenuLink
                          emphasized
                          href={item.href}
                          label={`Explore ${item.label}`}
                          onClick={closeMenus}
                        />

                        <div className="grid gap-6 pt-5">
                          {mobileSections.map((section) => (
                            <div key={section.title}>
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/34">
                                {section.title}
                              </p>

                              <div className="grid gap-1">
                                {section.links.map((link) => (
                                  <MobileSubmenuLink
                                    key={link.label}
                                    href={link.href}
                                    label={link.label}
                                    onClick={closeMenus}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile CTA */}
            <div
              className="mt-auto pt-7"
              style={getMobileItemMotion(navigation.length + 2)}
            >
              <div className="border-t border-black/[0.08] pt-5">
                <Link
                  href="#try-hermes"
                  onClick={closeMenus}
                  className="group flex items-center justify-between rounded-[14px] bg-black px-5 py-4 text-[15px] font-medium tracking-[-0.01em] text-white transition-[background-color,transform] duration-300 hover:bg-black/86 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                  style={{ textDecoration: "none" }}
                >
                  <span>Try Hermes</span>

                  <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <IconRightTop />
                  </span>
                </Link>

                <p className="pt-3 text-[12px] font-medium leading-[1.35] tracking-[-0.01em] text-black/38">
                  Premium AI workspace for faster creation.
                </p>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
