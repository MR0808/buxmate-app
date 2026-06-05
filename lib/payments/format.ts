export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function splitAmountCents(
  totalCents: number,
  guestCount: number,
): number[] {
  if (guestCount <= 0) return [];
  const base = Math.floor(totalCents / guestCount);
  const remainder = totalCents % guestCount;
  return Array.from({ length: guestCount }, (_, index) =>
    base + (index < remainder ? 1 : 0),
  );
}

export function deriveAllocationStatus(
  amountCents: number,
  amountPaidCents: number,
): "PENDING" | "PARTIAL" | "PAID" {
  if (amountPaidCents <= 0) return "PENDING";
  if (amountPaidCents >= amountCents) return "PAID";
  return "PARTIAL";
}
