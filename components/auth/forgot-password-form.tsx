"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setSent(false);

    const result = await requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setIsLoading(false);

    if (result.error) {
      toast.error(result.error.message ?? "Unable to send reset email");
      return;
    }

    setSent(true);
    toast.success("If that email exists, we sent a reset link");
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{email}</span>, check your inbox for a password reset link.
        </p>
        <Button
          variant="ghost"
          className="rounded-full normal-case tracking-normal"
          asChild
        >
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <Button
        type="submit"
        className="h-11 w-full rounded-full normal-case tracking-normal"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
