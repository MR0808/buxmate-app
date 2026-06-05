"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendVerificationEmail } from "@/lib/auth-client";

type ResendVerificationButtonProps = {
  email: string;
  className?: string;
};

export function ResendVerificationButton({
  email,
  className,
}: ResendVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleResend() {
    setIsLoading(true);

    const result = await sendVerificationEmail({
      email,
      callbackURL: "/login?verified=1",
    });

    setIsLoading(false);

    if (result.error) {
      toast.error(result.error.message ?? "Unable to resend verification email");
      return;
    }

    toast.success("Verification email sent — check your inbox");
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      disabled={isLoading || !email}
      onClick={handleResend}
    >
      {isLoading ? "Sending..." : "Resend verification email"}
    </Button>
  );
}
