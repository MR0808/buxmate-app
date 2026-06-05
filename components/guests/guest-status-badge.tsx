import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type GuestStatusValue = "INVITED" | "JOINED" | "DECLINED" | "ARCHIVED";

const statusConfig: Record<
  GuestStatusValue,
  { label: string; className: string }
> = {
  INVITED: {
    label: "Invited",
    className: "bg-brand-muted text-primary",
  },
  JOINED: {
    label: "Joined",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  DECLINED: {
    label: "Declined",
    className: "bg-muted text-muted-foreground",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-muted text-muted-foreground",
  },
};

type GuestStatusBadgeProps = {
  status: GuestStatusValue;
  className?: string;
};

export function GuestStatusBadge({ status, className }: GuestStatusBadgeProps) {
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
