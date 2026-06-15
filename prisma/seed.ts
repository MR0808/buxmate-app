import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { addDays, setHours, setMinutes } from "date-fns";
import {
  ActivityCostType,
  ActivityStatus,
  EventStatus,
  GuestStatus,
  PaymentAllocationMethod,
  PaymentCostScope,
  PaymentItemStatus,
  PaymentStatus,
  PostStatus,
  PostType,
  PrismaClient,
  RsvpStatus,
} from "../generated/prisma/client";
import { syncActivityPaymentItem } from "../lib/payments/activity-payment-sync";
import { recalculateEventPayments } from "../lib/payments/recalculate-event-payments";
import { splitAmountCents } from "../lib/payments/format";

function createSeedClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return configured ?? "http://localhost:3000";
}

function weekendStart(): Date {
  const base = addDays(new Date(), 21);
  return setMinutes(setHours(base, 14), 0);
}

const SEED_EVENT_SLUG = "daves-bucks-weekend";

async function ensureOrganiser(
  prisma: PrismaClient,
  {
    email,
    name,
    passwordHash,
  }: {
    email: string;
    name: string;
    passwordHash: string;
  },
) {
  let organiser = await prisma.user.findUnique({ where: { email } });

  if (!organiser) {
    organiser = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: true,
      },
    });
  } else {
    organiser = await prisma.user.update({
      where: { id: organiser.id },
      data: { name, emailVerified: true },
    });
  }

  const account = await prisma.account.findFirst({
    where: { userId: organiser.id, providerId: "credential" },
  });

  if (account) {
    await prisma.account.update({
      where: { id: account.id },
      data: { password: passwordHash },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: organiser.id,
        accountId: organiser.id,
        providerId: "credential",
        password: passwordHash,
      },
    });
  }

  return organiser;
}

async function clearSeedEvent(prisma: PrismaClient, slug: string) {
  const existing = await prisma.event.findUnique({ where: { slug } });

  if (!existing) {
    return;
  }

  await prisma.event.delete({ where: { id: existing.id } });
  console.log(`Removed existing seed event "${slug}" before reseeding.`);
}

async function main() {
  const prisma = createSeedClient();

  const organiserEmail =
    process.env.SEED_ORGANISER_EMAIL?.trim() ?? "organiser@buxmate.dev";
  const organiserPassword =
    process.env.SEED_ORGANISER_PASSWORD?.trim() ?? "password123";
  const organiserName =
    process.env.SEED_ORGANISER_NAME?.trim() ?? "Alex Organiser";

  const passwordHash = await hashPassword(organiserPassword);
  const eventStart = weekendStart();
  const eventEnd = addDays(eventStart, 2);

  const organiser = await ensureOrganiser(prisma, {
    email: organiserEmail,
    name: organiserName,
    passwordHash,
  });

  await clearSeedEvent(prisma, SEED_EVENT_SLUG);

  const event = await prisma.event.create({
    data: {
      organiserId: organiser.id,
      name: "Dave's Bucks Weekend",
      slug: SEED_EVENT_SLUG,
      eventType: "bucks",
      location: "Gold Coast, QLD",
      description:
        "A private bucks weekend — golf, boat day, and a big Saturday night. All details in Buxmate.",
      status: EventStatus.ACTIVE,
      startsAt: eventStart,
      endsAt: eventEnd,
      paymentInstructions:
        "Pay organiser via bank transfer. Reference your name.",
    },
  });

  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        eventId: event.id,
        title: "Friday arrival drinks",
        description: "Meet at the accommodation from 6pm. Casual dress.",
        location: "Surfers Paradise",
        startsAt: setMinutes(setHours(eventStart, 18), 0),
        endsAt: setMinutes(setHours(eventStart, 22), 0),
        costType: ActivityCostType.FREE,
        costCents: 0,
        sortOrder: 0,
        status: ActivityStatus.ACTIVE,
      },
    }),
    prisma.activity.create({
      data: {
        eventId: event.id,
        title: "Saturday golf",
        description: "Tee time booked for 9am. Clubs available for hire on site.",
        location: "Hope Island",
        startsAt: setMinutes(setHours(addDays(eventStart, 1), 9), 0),
        endsAt: setMinutes(setHours(addDays(eventStart, 1), 13), 0),
        costType: ActivityCostType.FIXED_PER_ATTENDING_GUEST,
        costCents: 12000,
        sortOrder: 1,
        status: ActivityStatus.ACTIVE,
      },
    }),
    prisma.activity.create({
      data: {
        eventId: event.id,
        title: "Saturday night out",
        description: "Dinner and drinks in the city. Smart casual.",
        location: "Broadbeach",
        startsAt: setMinutes(setHours(addDays(eventStart, 1), 19), 0),
        endsAt: setMinutes(setHours(addDays(eventStart, 1), 23), 30),
        costType: ActivityCostType.TOTAL_SPLIT_BY_ATTENDING_GUESTS,
        costCents: 150000,
        sortOrder: 2,
        status: ActivityStatus.ACTIVE,
      },
    }),
  ]);

  const [fridayDrinks, saturdayGolf, saturdayNight] = activities;

  type GuestSpec = {
    name: string;
    email: string;
    phone?: string;
    inviteToken: string;
    status: GuestStatus;
    isGuestOfHonour?: boolean;
    inviteSentAt?: Date;
    rsvps: Record<string, RsvpStatus>;
  };

  const guestSpecs: GuestSpec[] = [
    {
      name: "Dave Smith",
      email: "dave@example.com",
      phone: "0400 111 222",
      inviteToken: "seed-invite-dave-smith",
      status: GuestStatus.JOINED,
      isGuestOfHonour: true,
      inviteSentAt: new Date(),
      rsvps: {
        [fridayDrinks.id]: RsvpStatus.GOING,
        [saturdayGolf.id]: RsvpStatus.GOING,
        [saturdayNight.id]: RsvpStatus.GOING,
      },
    },
    {
      name: "Tom Nguyen",
      email: "tom@example.com",
      phone: "0400 333 444",
      inviteToken: "seed-invite-tom-nguyen",
      status: GuestStatus.JOINED,
      inviteSentAt: new Date(),
      rsvps: {
        [fridayDrinks.id]: RsvpStatus.GOING,
        [saturdayGolf.id]: RsvpStatus.GOING,
        [saturdayNight.id]: RsvpStatus.MAYBE,
      },
    },
    {
      name: "James Wilson",
      email: "james@example.com",
      inviteToken: "seed-invite-james-wilson",
      status: GuestStatus.INVITED,
      rsvps: {},
    },
    {
      name: "Chris O'Brien",
      email: "chris@example.com",
      inviteToken: "seed-invite-chris-obrien",
      status: GuestStatus.JOINED,
      inviteSentAt: new Date(),
      rsvps: {
        [fridayDrinks.id]: RsvpStatus.GOING,
        [saturdayGolf.id]: RsvpStatus.NOT_GOING,
        [saturdayNight.id]: RsvpStatus.GOING,
      },
    },
    {
      name: "Mike Carter",
      email: "mike@example.com",
      inviteToken: "seed-invite-mike-carter",
      status: GuestStatus.JOINED,
      inviteSentAt: new Date(),
      rsvps: {
        [fridayDrinks.id]: RsvpStatus.GOING,
        [saturdayGolf.id]: RsvpStatus.GOING,
        [saturdayNight.id]: RsvpStatus.GOING,
      },
    },
    {
      name: "Sam Patel",
      email: "sam@example.com",
      inviteToken: "seed-invite-sam-patel",
      status: GuestStatus.INVITED,
      rsvps: {},
    },
  ];

  const guests: { id: string; inviteToken: string }[] = [];
  for (const spec of guestSpecs) {
    const guest = await prisma.eventGuest.create({
      data: {
        eventId: event.id,
        name: spec.name,
        email: spec.email,
        phone: spec.phone ?? null,
        inviteToken: spec.inviteToken,
        status: spec.status,
        isGuestOfHonour: spec.isGuestOfHonour ?? false,
        inviteSentAt: spec.inviteSentAt ?? null,
        lastAccessedAt:
          spec.status === GuestStatus.JOINED ? new Date() : null,
      },
    });
    guests.push(guest);

    for (const [activityId, status] of Object.entries(spec.rsvps)) {
      await prisma.activityRsvp.create({
        data: {
          activityId,
          guestId: guest.id,
          status,
        },
      });
    }
  }

  for (const activity of activities) {
    await syncActivityPaymentItem(activity.id);
  }

  const honourExcludedGuests = guestSpecs
    .filter((spec) => !spec.isGuestOfHonour)
    .map(
      (spec) =>
        guests.find((guest) => guest.inviteToken === spec.inviteToken)!.id,
    );

  const groupGiftTotalCents = 30000;
  const giftShares = splitAmountCents(
    groupGiftTotalCents,
    honourExcludedGuests.length,
  );

  const groupGift = await prisma.paymentItem.create({
    data: {
      eventId: event.id,
      title: "Group gift for Dave",
      description: "Pooled gift — guest of honour excluded.",
      amountCents: groupGiftTotalCents,
      costScope: PaymentCostScope.EVENT_WIDE,
      allocationMethod:
        PaymentAllocationMethod.ALL_ACTIVE_GUESTS_EXCLUDING_GUEST_OF_HONOUR,
      excludeGuestOfHonour: true,
      isAutoGenerated: false,
      status: PaymentItemStatus.ACTIVE,
    },
  });

  await prisma.paymentAllocation.createMany({
    data: honourExcludedGuests.map((guestId, index) => ({
      paymentItemId: groupGift.id,
      guestId,
      amountCents: giftShares[index],
      amountPaidCents: 0,
      status: PaymentStatus.PENDING,
    })),
  });

  await recalculateEventPayments(event.id);

  await prisma.post.create({
    data: {
      eventId: event.id,
      authorUserId: organiser.id,
      type: PostType.ANNOUNCEMENT,
      content:
        "Welcome to the bucks weekend hub. Check the activity timeline, RSVP to each day, and upload photos as we go. Payment details are in the Payments tab.",
      pinned: true,
      status: PostStatus.ACTIVE,
    },
  });

  const appUrl = getAppBaseUrl();

  console.log("\n✓ Database seeded successfully\n");
  console.log("Organiser login");
  console.log(`  Email:    ${organiserEmail}`);
  console.log(`  Password: ${organiserPassword}`);
  console.log(`  App:      ${appUrl}/login`);
  console.log("");
  console.log("Sample event");
  console.log(`  Name:     ${event.name}`);
  console.log(`  Slug:     ${event.slug}`);
  console.log(`  Dashboard ${appUrl}/events/${event.id}`);
  console.log("");
  console.log("Guest invite links (for testing)");
  for (const spec of guestSpecs) {
    console.log(`  ${spec.name.padEnd(16)} ${appUrl}/join/${spec.inviteToken}`);
  }
  console.log("");

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
