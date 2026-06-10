import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeleton";

export default function AuthenticatedLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeaderSkeleton />
      <div className="mt-8">
        <CardGridSkeleton count={2} />
      </div>
    </main>
  );
}
