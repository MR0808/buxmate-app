import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ActivityStatusValue = "ACTIVE" | "ARCHIVED";

const statusConfig: Record<
  ActivityStatusValue,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-brand-muted text-primary",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-muted text-muted-foreground",
  },
};

type ActivityStatusBadgeProps = {
  status: ActivityStatusValue;
  className?: string;
};

export function ActivityStatusBadge({
  status,
  className,
}: ActivityStatusBadgeProps) {
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
