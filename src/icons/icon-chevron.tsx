export function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1)",
        opacity: 0.5,
      }}
    >
      <path d="M3 6l5 5 5-5" />
    </svg>
  );
}
