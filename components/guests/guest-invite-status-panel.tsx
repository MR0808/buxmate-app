import { AlertCircle, CheckCircle2, Clock, Mail } from "lucide-react";
import { GuestStatus } from "@/generated/prisma/client";
import { ExpireInviteButton } from "@/components/guests/expire-invite-button";
import { RegenerateInviteButton } from "@/components/guests/regenerate-invite-button";
import {
  formatInviteExpiry,
  getInviteLinkStatus,
} from "@/lib/invites/status";

type GuestInviteStatusPanelProps = {
  eventId: string;
  guestId: string;
  guestStatus: GuestStatus;
  inviteTokenExpiresAt: Date | null;
  inviteSentAt: Date | null;
  inviteEmailCount: number;
  lastAccessedAt: Date | null;
  canManage: boolean;
};

export function GuestInviteStatusPanel({
  eventId,
  guestId,
  guestStatus,
  inviteTokenExpiresAt,
  inviteSentAt,
  inviteEmailCount,
  lastAccessedAt,
  canManage,
}: GuestInviteStatusPanelProps) {
  const linkStatus = getInviteLinkStatus({
    guestStatus,
    inviteTokenExpiresAt,
  });

  const statusLabel =
    linkStatus === "archived"
      ? "Archived"
      : linkStatus === "expired"
        ? "Expired"
        : "Active";

  const statusIcon =
    linkStatus === "active" ? (
      <CheckCircle2 className="size-4 text-green-600" aria-hidden />
    ) : (
      <AlertCircle className="size-4 text-amber-600" aria-hidden />
    );

  return (
    <section className="buxmate-card space-y-4 p-6 sm:p-8">
      <h2 className="font-heading text-lg font-semibold">Invite management</h2>

      {linkStatus === "expired" ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            This invite link is no longer valid.
          </p>
          <p className="mt-1 text-muted-foreground">
            Regenerate a new link or ask the organiser to send a fresh invite.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex gap-3 rounded-xl border border-border/60 p-4">
          {statusIcon}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Link status
            </p>
            <p className="mt-1 font-medium">{statusLabel}</p>
            {inviteTokenExpiresAt && linkStatus === "active" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Expires {formatInviteExpiry(inviteTokenExpiresAt)}
              </p>
            ) : null}
            {linkStatus === "expired" && inviteTokenExpiresAt ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Expired {formatInviteExpiry(inviteTokenExpiresAt)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex gap-3 rounded-xl border border-border/60 p-4">
          <Mail className="size-4 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Emails sent
            </p>
            <p className="mt-1 font-medium">
              {inviteEmailCount} time{inviteEmailCount === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {inviteSentAt
                ? `Last sent ${inviteSentAt.toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}`
                : "Not emailed yet"}
            </p>
          </div>
        </div>

        <div className="flex gap-3 rounded-xl border border-border/60 p-4">
          <Clock className="size-4 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Last opened
            </p>
            <p className="mt-1 font-medium">
              {lastAccessedAt
                ? lastAccessedAt.toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Never opened"}
            </p>
          </div>
        </div>
      </div>

      {canManage && guestStatus !== GuestStatus.ARCHIVED ? (
        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <RegenerateInviteButton eventId={eventId} guestId={guestId} />
          {linkStatus === "active" ? (
            <ExpireInviteButton eventId={eventId} guestId={guestId} />
          ) : linkStatus === "expired" ? (
            <ExpireInviteButton
              eventId={eventId}
              guestId={guestId}
              mode="reactivate"
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
