export type GuestRsvpStatus = "GOING" | "MAYBE" | "NOT_GOING" | "PENDING";

export const RSVP_STATUS_LABELS: Record<
  GuestRsvpStatus,
  { organiser: string; guest: string }
> = {
  GOING: { organiser: "Going", guest: "Going" },
  MAYBE: { organiser: "Maybe", guest: "Maybe" },
  NOT_GOING: { organiser: "Not going", guest: "Can't make it" },
  PENDING: { organiser: "Pending", guest: "Not answered" },
};
