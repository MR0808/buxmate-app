import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EventStatusValue = "DRAFT" | "ACTIVE" | "ARCHIVED";

const statusConfig: Record<
  EventStatusValue,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-brand-muted text-primary",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-muted text-muted-foreground line-through decoration-muted-foreground/50",
  },
};

type EventStatusBadgeProps = {
  status: EventStatusValue;
  className?: string;
};

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[0.65rem] normal-case tracking-wide",
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
