import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, Link2, MapPin, Shield } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { JoinGuestForm } from "@/components/guest/join-guest-form";
import { formatEventDateRange } from "@/lib/events/format";
import { validateInviteForJoin } from "@/lib/guest-access";
import { readGuestSessionCookie } from "@/lib/guest-session";

type JoinPageProps = {
  params: Promise<{ inviteToken: string }>;
};

function InvalidInvite({ message }: { message: string }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border/60 px-4 py-4 sm:px-6">
        <Logo />
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="buxmate-card p-6 text-center sm:p-8">
          <h1 className="font-heading text-2xl font-semibold">
            Invite not available
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{message}</p>
          <p className="mt-6 text-sm text-muted-foreground">
            Ask the organiser for a new link.
          </p>
        </div>
      </main>
    </div>
  );
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { inviteToken } = await params;
  const result = await validateInviteForJoin(inviteToken);

  if (!result) {
    notFound();
  }

  if ("invalid" in result) {
    const message =
      result.invalid === "guest_archived"
        ? "This guest invite is no longer active."
        : result.invalid === "event_archived"
          ? "This event is no longer available."
          : "This invite link has expired.";
    return <InvalidInvite message={message} />;
  }

  const { guest } = result;

  const existingSession = await readGuestSessionCookie();
  if (
    existingSession?.guestId === guest.id &&
    existingSession.eventSlug === guest.event.slug
  ) {
    redirect(`/e/${guest.event.slug}`);
  }

  const firstName = guest.name.split(" ")[0];
  const dateRange = formatEventDateRange(
    guest.event.startsAt,
    guest.event.endsAt,
  );

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border/60 px-4 py-4 sm:px-6">
        <Logo />
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="buxmate-card p-6 sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-muted text-primary">
            <Link2 className="size-5" aria-hidden />
          </div>

          <p className="mt-5 text-xs uppercase tracking-wider text-primary">
            Private invite
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold">
            Hi {firstName}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            You&apos;re invited to{" "}
            <span className="font-medium text-foreground">{guest.event.name}</span>
          </p>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-start gap-2 text-muted-foreground">
              <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{dateRange}</span>
            </div>
            {guest.event.location ? (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{guest.event.location}</span>
              </div>
            ) : null}
          </dl>

          <JoinGuestForm
            inviteToken={inviteToken}
            initial={{
              name: guest.name,
              email: guest.email ?? "",
              phone: guest.phone ?? "",
            }}
          />

          <div className="mt-6 flex gap-3 rounded-2xl border border-border/70 bg-brand-muted/50 p-4 text-sm text-muted-foreground">
            <Shield className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <p>
              Only people with this private link can access the event. Your
              details are only shared with the organiser.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Organising an event?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Organiser sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
