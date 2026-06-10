import {
  ListSkeleton,
  PageHeaderSkeleton,
  Skeleton,
} from "@/components/shared/skeleton";

export default function EventLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-48 w-full rounded-2xl" />
      <PageHeaderSkeleton />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="mt-8">
        <ListSkeleton count={3} />
      </div>
    </main>
  );
}
