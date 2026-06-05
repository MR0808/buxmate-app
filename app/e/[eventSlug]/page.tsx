import Link from "next/link";
import { CalendarDays, CreditCard, Shield } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { EmptyState } from "@/components/shared/empty-state";

type GuestEventPageProps = {
  params: Promise<{ eventSlug: string }>;
};

export default async function GuestEventPage({ params }: GuestEventPageProps) {
  const { eventSlug } = await params;

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border/60 px-4 py-4 sm:px-6">
        <Logo />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <div className="buxmate-card p-6 sm:p-8">
          <p className="text-xs uppercase tracking-wider text-primary">
            Private event
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">
            Event details
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {eventSlug}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Guest event view — itinerary, RSVPs and payment summary will appear
            here after you join via your invite link.
          </p>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="buxmate-card p-5">
            <CalendarDays className="size-5 text-primary" aria-hidden />
            <h2 className="mt-3 font-heading text-base font-semibold">
              Itinerary
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Activities and times for the weekend
            </p>
          </div>
          <div className="buxmate-card p-5">
            <CreditCard className="size-5 text-primary" aria-hidden />
            <h2 className="mt-3 font-heading text-base font-semibold">
              What you owe
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Payment summary and instructions
            </p>
          </div>
        </section>

        <div className="mt-8">
          <EmptyState
            icon={Shield}
            title="Verified guest access required"
            description="Open your private invite link to view this event's full details, RSVP to activities, and see what you owe."
          />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Lost your invite? Ask the organiser for a new link.{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Organiser sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
