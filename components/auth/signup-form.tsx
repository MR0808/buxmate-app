"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { FormBusyShell } from "@/components/shared/form-busy-shell";
import { useFormSubmit } from "@/lib/hooks/use-form-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/lib/analytics";
import { signUp } from "@/lib/auth-client";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isBusy, start, fail, succeed, submitLabel } = useFormSubmit();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    start();

    const result = await signUp.email({
      name,
      email,
      password,
      callbackURL: "/login?verified=1",
    });

    if (result.error) {
      fail();
      toast.error(result.error.message ?? "Unable to create account");
      return;
    }

    trackEvent("sign_up_completed", {
      event_category: "auth",
      method: "email",
    });
    toast.success("Account created — check your email to verify");
    succeed({ href: `/check-email?email=${encodeURIComponent(email)}` });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormBusyShell busy={isBusy} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Alex"
          className="rounded-xl border border-border bg-card px-4"
        />
      </div>

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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          className="rounded-xl border border-border bg-card px-4"
        />
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-full normal-case tracking-normal"
        disabled={isBusy}
      >
        {submitLabel({
          idle: "Create account",
          submitting: "Creating account...",
        })}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
      </FormBusyShell>
    </form>
  );
}
