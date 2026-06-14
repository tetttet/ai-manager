export default function CtaSection() {
  return (
    <section className="w-full bg-[#f4f2eb] px-6 pb-16 sm:pb-20 lg:pb-24">
      <div className="mx-auto max-w-[1280px] rounded-lg bg-[#fdfbf6]">
        <div className="flex flex-col items-center gap-6 px-6 py-14 text-center md:px-10 md:py-16">
          <h2 className="max-w-2xl font-serif text-[30px] font-medium leading-[1.12] tracking-tight text-black sm:text-[44px]">
            Guides and resources for integrating AI into your business
          </h2>

          <a
            href="https://forms.gle/9ZtL7n5sHj3mXoVv6"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdfbf6]"
          >
            Join our family
          </a>
        </div>
      </div>
    </section>
  );
}
