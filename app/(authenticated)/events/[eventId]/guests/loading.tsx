import { ListSkeleton, PageHeaderSkeleton } from "@/components/shared/skeleton";

export default function GuestsLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeaderSkeleton />
      <SkeletonBar />
      <div className="mt-6">
        <ListSkeleton count={5} />
      </div>
    </main>
  );
}

function SkeletonBar() {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
      <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
      <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
