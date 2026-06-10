"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendGuestInviteEmail } from "@/lib/actions/emails";
import { trackEvent } from "@/lib/analytics";

type SendGuestInviteButtonProps = {
  eventId: string;
  guestId: string;
  guestEmail: string | null;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
};

export function SendGuestInviteButton({
  eventId,
  guestId,
  guestEmail,
  disabled,
  variant = "outline",
  size = "sm",
}: SendGuestInviteButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!guestEmail?.trim()) {
    return null;
  }

  async function handleSend() {
    setIsLoading(true);
    const result = await sendGuestInviteEmail(eventId, guestId);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    trackEvent("invite_email_sent", {
      event_category: "guest",
      source: "single",
      count: 1,
    });
    toast.success("Invite email sent");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className="rounded-full normal-case tracking-normal"
      disabled={disabled || isLoading}
      onClick={handleSend}
    >
      <Mail className="size-4" aria-hidden />
      {isLoading ? "Sending..." : "Send invite"}
    </Button>
  );
}
