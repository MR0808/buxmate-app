import { ListSkeleton, PageHeaderSkeleton } from "@/components/shared/skeleton";

export default function ActivitiesLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeaderSkeleton />
      <div className="mt-8">
        <ListSkeleton count={4} />
      </div>
    </main>
  );
}
