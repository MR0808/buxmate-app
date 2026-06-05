export type AllocationPaymentStatus =
  | "PENDING"
  | "PARTIAL"
  | "PAID"
  | "WAIVED";

export const PAYMENT_STATUS_LABELS: Record<
  AllocationPaymentStatus,
  { organiser: string; guest: string }
> = {
  PENDING: { organiser: "Pending", guest: "Still owing" },
  PARTIAL: { organiser: "Partial", guest: "Part paid" },
  PAID: { organiser: "Paid", guest: "Paid" },
  WAIVED: { organiser: "Waived", guest: "Waived" },
};

export function toAllocationPaymentStatus(
  status: AllocationPaymentStatus | string,
): AllocationPaymentStatus {
  if (status === "PENDING" || status === "PARTIAL" || status === "PAID" || status === "WAIVED") {
    return status;
  }
  return "PENDING";
}
