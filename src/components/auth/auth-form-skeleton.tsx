import { Skeleton } from "@/components/ui/skeleton";

export function AuthFormSkeleton() {
  return (
    <div
      className="w-full max-w-[400px]"
      role="status"
      aria-label="Loading authentication form"
    >
      <div className="space-y-3 text-center lg:text-left">
        <Skeleton className="mx-auto h-7 w-44 bg-zinc-300/70 lg:mx-0" />
        <Skeleton className="mx-auto h-4 w-64 max-w-full bg-zinc-300/60 lg:mx-0" />
      </div>

      <div className="mt-8 space-y-3">
        <Skeleton className="h-11 w-full rounded-lg bg-white/80" />
        <Skeleton className="h-11 w-full rounded-lg bg-white/80" />
      </div>

      <div className="my-6 flex items-center gap-3">
        <Skeleton className="h-px flex-1 rounded-none bg-zinc-300/70" />
        <Skeleton className="h-3 w-20 bg-zinc-300/60" />
        <Skeleton className="h-px flex-1 rounded-none bg-zinc-300/70" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-zinc-300/60" />
          <Skeleton className="h-11 w-full rounded-lg bg-white/90" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg bg-zinc-950/80" />
      </div>

      <div className="mt-6 flex justify-center gap-2 lg:justify-start">
        <Skeleton className="h-4 w-32 bg-zinc-300/60" />
        <Skeleton className="h-4 w-16 bg-zinc-300/70" />
      </div>
      <span className="sr-only">Loading authentication form</span>
    </div>
  );
}
