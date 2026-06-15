"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { FormBusyShell } from "@/components/shared/form-busy-shell";
import { useFormSubmit } from "@/lib/hooks/use-form-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { isBusy, start, fail, succeed, submitLabel } = useFormSubmit();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    start();

    const result = await resetPassword({
      newPassword: password,
      token,
    });

    if (result.error) {
      fail();
      toast.error(result.error.message ?? "Unable to reset password");
      return;
    }

    toast.success("Password updated — you can sign in now");
    succeed({ href: "/login" });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormBusyShell busy={isBusy} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat your password"
          className="rounded-xl border border-border bg-card px-4"
        />
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-full normal-case tracking-normal"
        disabled={isBusy}
      >
        {submitLabel({
          idle: "Update password",
          submitting: "Updating...",
        })}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </p>
      </FormBusyShell>
    </form>
  );
}
