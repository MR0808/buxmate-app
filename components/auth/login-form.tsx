"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FormBusyShell } from "@/components/shared/form-busy-shell";
import { useFormSubmit } from "@/lib/hooks/use-form-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/lib/analytics";
import { signIn } from "@/lib/auth-client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isBusy, start, fail, succeed, submitLabel } = useFormSubmit();
  const verified = searchParams.get("verified") === "1";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    start();

    const result = await signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    if (result.error) {
      const isUnverified =
        result.error.status === 403 ||
        result.error.message?.toLowerCase().includes("verify");

      if (isUnverified) {
        toast.error("Please verify your email before signing in");
        succeed({
          href: `/check-email?email=${encodeURIComponent(email)}`,
        });
        return;
      }

      fail();
      toast.error(result.error.message ?? "Unable to sign in");
      return;
    }

    trackEvent("login_completed", {
      event_category: "auth",
      method: "email",
    });
    toast.success("Welcome back");
    succeed({ href: "/" });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormBusyShell busy={isBusy} className="space-y-5">
      {verified ? (
        <div className="rounded-2xl border border-border/70 bg-brand-muted/50 p-4 text-sm text-muted-foreground">
          Your email is verified. Sign in to start planning your event.
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="rounded-xl border border-border bg-card px-4"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
          className="rounded-xl border border-border bg-card px-4"
        />
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-full normal-case tracking-normal"
        disabled={isBusy}
      >
        {submitLabel({
          idle: "Sign in",
          submitting: "Signing in...",
        })}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
      </FormBusyShell>
    </form>
  );
}
