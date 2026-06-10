"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border/60 px-4 py-4 sm:px-6">
        <Logo />
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="buxmate-card p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" aria-hidden />
          </div>
          <h1 className="font-heading text-2xl font-semibold">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We hit an unexpected problem. Try again, or return to your
            dashboard if the issue persists.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              className="rounded-full normal-case tracking-normal"
              onClick={reset}
            >
              Try again
            </Button>
            <Button
              variant="outline"
              className="rounded-full normal-case tracking-normal"
              asChild
            >
              <Link href="/">Go to dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
