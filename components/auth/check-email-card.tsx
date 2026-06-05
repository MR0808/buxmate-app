import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";

type CheckEmailCardProps = {
  email?: string;
};

export function CheckEmailCard({ email }: CheckEmailCardProps) {
  return (
    <div className="buxmate-card p-6 text-center sm:p-8">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-primary">
        <Mail className="size-6" aria-hidden />
      </div>

      <h1 className="mt-5 font-heading text-2xl font-semibold">Check your email</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        We&apos;ve sent you a secure verification link. Open it to activate your
        Buxmate account before you can plan events.
      </p>

      {email ? (
        <p className="mt-4 text-sm font-medium text-foreground">{email}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3">
        {email ? (
          <ResendVerificationButton
            email={email}
            className="h-11 w-full rounded-full normal-case tracking-normal"
          />
        ) : null}
        <Button
          variant="ghost"
          className="h-11 w-full rounded-full normal-case tracking-normal"
          asChild
        >
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    </div>
  );
}
