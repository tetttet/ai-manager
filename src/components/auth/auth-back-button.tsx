import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AuthBackButton() {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon-lg"
      className="border border-zinc-900/10 bg-white/45 text-zinc-900 backdrop-blur-sm hover:bg-white/70"
      aria-label="Go to home page"
      title="Go to home page"
    >
      <Link href="/">
        <ArrowLeft aria-hidden="true" />
      </Link>
    </Button>
  );
}
