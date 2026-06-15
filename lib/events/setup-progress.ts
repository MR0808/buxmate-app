import {
  ActivityCostType,
  ActivityStatus,
  GuestStatus,
  PaymentItemStatus,
  RsvpStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type SetupStepId =
  | "event-details"
  | "activities"
  | "guests"
  | "guest-of-honour"
  | "costs"
  | "payment-review"
  | "invites"
  | "track-rsvps";

export type SetupStep = {
  id: SetupStepId;
  title: string;
  description: string;
  completed: boolean;
  ctaLabel: string;
  ctaHref: string;
};

export type EventSetupProgress = {
  steps: SetupStep[];
  completedCount: number;
  totalCount: number;
  isFullySetup: boolean;
  percentComplete: number;
};

export async function getEventSetupProgress(
  eventId: string,
): Promise<EventSetupProgress> {
  const [
    event,
    activeActivityCount,
    paidActivityCostCount,
    activeGuestCount,
    honourGuestCount,
    paymentItemCount,
    allocationCount,
    inviteReadyCount,
    rsvpResponseCount,
  ] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
      select: { name: true, startsAt: true },
    }),
    prisma.activity.count({
      where: { eventId, status: ActivityStatus.ACTIVE },
    }),
    prisma.activity.count({
      where: {
        eventId,
        status: ActivityStatus.ACTIVE,
        costType: { not: ActivityCostType.FREE },
        costCents: { gt: 0 },
      },
    }),
    prisma.eventGuest.count({
      where: { eventId, status: { not: GuestStatus.ARCHIVED } },
    }),
    prisma.eventGuest.count({
      where: {
        eventId,
        status: { not: GuestStatus.ARCHIVED },
        isGuestOfHonour: true,
      },
    }),
    prisma.paymentItem.count({
      where: { eventId, status: PaymentItemStatus.ACTIVE },
    }),
    prisma.paymentAllocation.count({
      where: {
        paymentItem: { eventId, status: PaymentItemStatus.ACTIVE },
      },
    }),
    prisma.eventGuest.count({
      where: {
        eventId,
        status: { not: GuestStatus.ARCHIVED },
        OR: [
          { inviteSentAt: { not: null } },
          { status: GuestStatus.JOINED },
        ],
      },
    }),
    prisma.activityRsvp.count({
      where: {
        activity: { eventId },
        status: { not: RsvpStatus.PENDING },
      },
    }),
  ]);

  if (!event) {
    throw new Error("Event not found");
  }

  const hasEventDetails = Boolean(event.name?.trim() && event.startsAt);
  const hasActivities = activeActivityCount > 0;
  const hasGuests = activeGuestCount > 0;
  const hasGuestOfHonour = honourGuestCount > 0;
  const hasCosts = paidActivityCostCount > 0 || paymentItemCount > 0;
  const hasPaymentReview = allocationCount > 0;
  const hasInvites = inviteReadyCount > 0;
  const hasRsvpTracking = rsvpResponseCount > 0;

  const steps: SetupStep[] = [
    {
      id: "event-details",
      title: "Add event details",
      description: "Name, dates and location so guests know what they are joining.",
      completed: hasEventDetails,
      ctaLabel: "Edit event",
      ctaHref: `/events/${eventId}/settings`,
    },
    {
      id: "activities",
      title: "Add activities",
      description: "Build the itinerary — drinks, activities, accommodation and more.",
      completed: hasActivities,
      ctaLabel: "Add activity",
      ctaHref: `/events/${eventId}/activities/new`,
    },
    {
      id: "guests",
      title: "Add guests",
      description: "Add everyone attending so you can track RSVPs and payments.",
      completed: hasGuests,
      ctaLabel: "Add guest",
      ctaHref: `/events/${eventId}/guests/new`,
    },
    {
      id: "guest-of-honour",
      title: "Mark guest of honour",
      description: "Tag the buck, hen or birthday person to exclude them from shared costs.",
      completed: hasGuestOfHonour,
      ctaLabel: "Manage guests",
      ctaHref: `/events/${eventId}/guests`,
    },
    {
      id: "costs",
      title: "Add or confirm costs",
      description: "Set activity costs and any event-wide shared expenses.",
      completed: hasCosts,
      ctaLabel: "Review payments",
      ctaHref: `/events/${eventId}/payments`,
    },
    {
      id: "payment-review",
      title: "Review payment splits",
      description: "Check who owes what before sending invites.",
      completed: hasPaymentReview,
      ctaLabel: "Review payments",
      ctaHref: `/events/${eventId}/payments`,
    },
    {
      id: "invites",
      title: "Send invites",
      description: "Share private invite links so guests can RSVP.",
      completed: hasInvites,
      ctaLabel: "Send invites",
      ctaHref: `/events/${eventId}/guests`,
    },
    {
      id: "track-rsvps",
      title: "Track RSVPs and payments",
      description: "Follow responses and mark payments as they come in.",
      completed: hasRsvpTracking,
      ctaLabel: "View dashboard",
      ctaHref: `/events/${eventId}`,
    },
  ];

  const completedCount = steps.filter((step) => step.completed).length;

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    isFullySetup: completedCount === steps.length,
    percentComplete: Math.round((completedCount / steps.length) * 100),
  };
}
