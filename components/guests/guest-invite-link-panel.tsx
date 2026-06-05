"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { CopyInviteLinkButton } from "@/components/guests/copy-invite-link-button";
import { RegenerateInviteButton } from "@/components/guests/regenerate-invite-button";

type GuestInviteLinkPanelProps = {
  eventId: string;
  guestId: string;
  initialInviteUrl: string;
  canRegenerate: boolean;
};

export function GuestInviteLinkPanel({
  eventId,
  guestId,
  initialInviteUrl,
  canRegenerate,
}: GuestInviteLinkPanelProps) {
  const [inviteUrl, setInviteUrl] = useState(initialInviteUrl);

  return (
    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Link2 className="size-4 text-primary" aria-hidden />
        Private invite link
      </div>
      <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
        {inviteUrl}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyInviteLinkButton inviteUrl={inviteUrl} />
        {canRegenerate ? (
          <RegenerateInviteButton
            eventId={eventId}
            guestId={guestId}
            onRegenerated={setInviteUrl}
          />
        ) : null}
      </div>
    </div>
  );
}
