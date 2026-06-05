import { Badge } from "@/components/ui/badge";
import {
  PAYMENT_STATUS_LABELS,
  type AllocationPaymentStatus,
} from "@/lib/payments/status-labels";
import { cn } from "@/lib/utils";

const statusStyles: Record<AllocationPaymentStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  PARTIAL: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  WAIVED: "bg-muted text-muted-foreground",
};

type PaymentStatusBadgeProps = {
  status: AllocationPaymentStatus;
  audience?: "organiser" | "guest";
  className?: string;
};

export function PaymentStatusBadge({
  status,
  audience = "organiser",
  className,
}: PaymentStatusBadgeProps) {
  const label = PAYMENT_STATUS_LABELS[status][audience];

  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[0.65rem] normal-case tracking-wide",
        statusStyles[status],
        className,
      )}
    >
      {label}
    </Badge>
  );
}
