import { CreditCard } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function EventPaymentsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold">Payments</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track what each guest owes and who has paid.
        </p>
      </div>

      <EmptyState
        icon={CreditCard}
        title="No payment items yet"
        description="Add payment items and mark guests as paid when money comes through."
      />
    </main>
  );
}
