import { HeroSkeleton, PostCardSkeleton, Skeleton } from "@/components/common/Skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero skeleton */}
      <HeroSkeleton />

      {/* Category bar skeleton */}
      <div className="mt-10 flex gap-2 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
        ))}
      </div>

      {/* Recent posts skeleton */}
      <div className="mt-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
