import Image from "next/image";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  children: ReactNode;
  topLeft?: ReactNode;
};

export function AuthPageShell({ children, topLeft }: AuthPageShellProps) {
  return (
    <main className="relative grid min-h-dvh bg-[#f4f2eb] text-black lg:grid-cols-2">
      {topLeft ? (
        <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
          {topLeft}
        </div>
      ) : null}

      <section className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[440px]">
          <div className="flex justify-center lg:justify-start">{children}</div>
        </div>
      </section>

      <section className="relative hidden min-h-dvh overflow-hidden bg-[#ebe4d4] lg:block">
        <Image
          src="/images/etc/hero-image.png"
          alt="Hermes AI workspace"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </section>
    </main>
  );
}
