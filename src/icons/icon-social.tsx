import { SOCIAL_LINKS } from "@/constants/socials-url";

const iconClassName =
  "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110";

export function SocialIcon({
  kind,
}: {
  kind: (typeof SOCIAL_LINKS)[number]["kind"];
}) {
  if (kind === "linkedin") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={iconClassName}
      >
        <path d="M4.98 3.5a2.48 2.48 0 1 0 0 4.96 2.48 2.48 0 0 0 0-4.96ZM3 8.98h3.96V21H3V8.98Zm7.12 0H14v1.64h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.65 4.77 6.1V21h-3.96v-5.54c0-1.32-.02-3.02-1.84-3.02-1.85 0-2.14 1.44-2.14 2.92V21h-3.96V8.98Z" />
      </svg>
    );
  }

  if (kind === "github") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={iconClassName}
      >
        <path d="M12 .6a12 12 0 0 0-3.79 23.38c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.4-1.34-1.77-1.34-1.77-1.1-.74.08-.72.08-.72 1.22.09 1.86 1.26 1.86 1.26 1.08 1.86 2.84 1.32 3.53 1.01.11-.79.43-1.32.77-1.63-2.67-.3-5.48-1.34-5.48-5.97 0-1.32.47-2.4 1.25-3.24-.13-.3-.54-1.53.12-3.19 0 0 1.02-.33 3.34 1.24a11.6 11.6 0 0 1 6.08 0c2.31-1.57 3.33-1.24 3.33-1.24.67 1.66.26 2.89.13 3.19.78.84 1.24 1.92 1.24 3.24 0 4.64-2.82 5.66-5.51 5.96.44.38.82 1.11.82 2.25v3.33c0 .32.21.7.83.58A12 12 0 0 0 12 .6Z" />
      </svg>
    );
  }

  if (kind === "instagram") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className={iconClassName}
      >
        <rect
          x="3.25"
          y="3.25"
          width="17.5"
          height="17.5"
          rx="5.25"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle
          cx="12"
          cy="12"
          r="4.1"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={iconClassName}
    >
      <path
        d="M4 4 20 20M20 4 4 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
