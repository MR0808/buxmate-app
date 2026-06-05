import type { RsvpCounts } from "@/lib/rsvp";

type RsvpCountsProps = {
  counts: RsvpCounts;
  compact?: boolean;
};

export function RsvpCountsDisplay({ counts, compact }: RsvpCountsProps) {
  if (counts.total === 0) {
    return (
      <p className="text-xs text-muted-foreground">No RSVPs yet</p>
    );
  }

  const items = [
    { label: "Going", value: counts.going },
    { label: "Maybe", value: counts.maybe },
    { label: "Not going", value: counts.notGoing },
    { label: "Pending", value: counts.pending },
  ].filter((item) => item.value > 0);

  if (compact) {
    return (
      <p className="text-xs text-muted-foreground">
        {items.map((item) => `${item.value} ${item.label.toLowerCase()}`).join(" · ")}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.label}
          className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
        >
          {item.value} {item.label}
        </span>
      ))}
    </div>
  );
}
