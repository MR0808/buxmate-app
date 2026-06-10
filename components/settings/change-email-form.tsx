"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeEmail } from "@/lib/auth-client";
import { changeEmailSchema } from "@/lib/validations/settings";

type ChangeEmailFormProps = {
  currentEmail: string;
};

export function ChangeEmailForm({ currentEmail }: ChangeEmailFormProps) {
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = changeEmailSchema.safeParse({ newEmail });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email.");
      return;
    }

    if (parsed.data.newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      toast.error("That is already your email address.");
      return;
    }

    setIsLoading(true);
    const { error } = await changeEmail({
      newEmail: parsed.data.newEmail,
      callbackURL: "/settings",
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message ?? "Could not start email change.");
      return;
    }

    toast.success("Check your new email to confirm the change.");
    setNewEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Current email: <span className="font-medium text-foreground">{currentEmail}</span>
      </p>
      <div className="space-y-2">
        <Label htmlFor="new-email">New email</Label>
        <Input
          id="new-email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-11 rounded-xl"
          required
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        className="rounded-full normal-case tracking-normal"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Change email"}
      </Button>
      <p className="text-xs text-muted-foreground">
        We&apos;ll send a verification link to your new address.
      </p>
    </form>
  );
}
