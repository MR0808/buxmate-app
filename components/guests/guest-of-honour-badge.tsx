import { Crown } from "lucide-react";

export function GuestOfHonourBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-brand-muted/60 px-2.5 py-0.5 text-xs font-medium text-primary">
      <Crown className="size-3" aria-hidden />
      Guest of honour
    </span>
  );
}
