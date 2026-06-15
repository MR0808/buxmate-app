import { formatMoney } from "@/lib/payments/format";
import type { PaymentAllocationPreview } from "@/lib/payments/preview";
import { GuestOfHonourBadge } from "@/components/guests/guest-of-honour-badge";

type PaymentAllocationPreviewPanelProps = {
  preview: PaymentAllocationPreview | null;
  loading?: boolean;
};

export function PaymentAllocationPreviewPanel({
  preview,
  loading = false,
}: PaymentAllocationPreviewPanelProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
        Calculating preview...
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
        Fill in the details above to preview who will be charged.
      </div>
    );
  }

  if (preview.guests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
        No eligible guests for this split yet. Add guests or check RSVPs.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-brand-muted/30 p-6">
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">
        Preview
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {preview.amountPerGuestLabel} · Total allocated{" "}
        {formatMoney(preview.totalAllocatedCents)}
      </p>
      <ul className="mt-4 space-y-2">
        {preview.guests.map((guest) => (
          <li
            key={guest.guestId}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{guest.guestName}</span>
              {guest.isGuestOfHonour ? <GuestOfHonourBadge /> : null}
            </span>
            <span className="font-medium">{formatMoney(guest.amountCents)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
