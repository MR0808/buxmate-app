import Link from "next/link";
import { Link2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

type JoinPageProps = {
  params: Promise<{ inviteToken: string }>;
};

export default async function JoinPage({ params }: JoinPageProps) {
  const { inviteToken } = await params;

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

          <h1 className="mt-5 font-heading text-2xl font-semibold">
            You&apos;re invited
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Enter your details to join this private event. No full account
            required — just your name and contact info.
          </p>

          <div className="mt-6 space-y-4 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">Guest join form</p>
            <p className="text-sm text-muted-foreground">
              Name, email and phone fields will connect to invite token{" "}
              <span className="font-mono text-xs">{inviteToken.slice(0, 8)}…</span>{" "}
              in the next phase.
            </p>
          </div>

          <div className="mt-6 flex gap-3 rounded-2xl border border-border/70 bg-brand-muted/50 p-4 text-sm text-muted-foreground">
            <Shield className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <p>
              This is a private invite link. Only people with this link can
              access the event.
            </p>
          </div>

          <Button
            className="mt-6 h-11 w-full rounded-full normal-case tracking-normal"
            disabled
          >
            Join event (coming soon)
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Organising an event?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </main>
    </div>
  );
}
