import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { EventStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { GuestListManager } from "@/components/guests/guest-list-manager";
import { getOrganiserGuestsList } from "@/lib/guests/queries";
import type { GuestSort, GuestStatusFilter } from "@/lib/guests/types";
import { getOrganiserEvent } from "@/lib/events";

type GuestsPageProps = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
  }>;
};

export default async function EventGuestsPage({
  params,
  searchParams,
}: GuestsPageProps) {
  const { eventId } = await params;
  const query = await searchParams;

  const status = (query.status as GuestStatusFilter) || "all";
  const sort = (query.sort as GuestSort) || "newest";
  const search = query.q?.trim() ?? "";

  const [event, guests] = await Promise.all([
    getOrganiserEvent(eventId),
    getOrganiserGuestsList(eventId, { search, status, sort }),
  ]);

  const activeGuests = guests.filter((g) => g.status !== "ARCHIVED");
  const canAdd = event.status !== EventStatus.ARCHIVED;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">
            {event.name}
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold">Guests</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeGuests.length} active · {guests.length} shown
          </p>
        </div>
        {canAdd ? (
          <Button className="rounded-full normal-case tracking-normal" asChild>
            <Link href={`/events/${eventId}/guests/new`}>
              <Plus className="size-4" aria-hidden />
              Add guest
            </Link>
          </Button>
        ) : null}
      </div>

      <Suspense fallback={<p className="mt-6 text-sm text-muted-foreground">Loading guests...</p>}>
        <GuestListManager
          eventId={eventId}
          guests={guests}
          canManage={canAdd}
          initialSearch={search}
          initialStatus={status}
          initialSort={sort}
        />
      </Suspense>
    </main>
  );
}
