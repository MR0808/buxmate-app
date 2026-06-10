import type { GuestStatus } from "@/generated/prisma/client";
import type { OrganiserGuest } from "@/lib/guests";

export type GuestSort = "name" | "newest" | "oldest" | "recent";

export type GuestStatusFilter =
  | "all"
  | "invited"
  | "joined"
  | "declined"
  | "archived";

export type GuestRsvpSummary = {
  going: number;
  maybe: number;
  notGoing: number;
  pending: number;
  total: number;
};

export type GuestPaymentSummary = {
  owed: number;
  paid: number;
  outstanding: number;
};

export type GuestListItem = OrganiserGuest & {
  rsvpSummary: GuestRsvpSummary;
  paymentSummary: GuestPaymentSummary;
  hasPendingRsvp: boolean;
};

export type GuestListFilters = {
  search?: string;
  status?: GuestStatusFilter;
  sort?: GuestSort;
};

export const GUEST_STATUS_FILTER_MAP: Record<
  Exclude<GuestStatusFilter, "all">,
  GuestStatus
> = {
  invited: "INVITED",
  joined: "JOINED",
  declined: "DECLINED",
  archived: "ARCHIVED",
};
