export type InviteLinkStatus = "active" | "expired" | "archived";

export function getInviteLinkStatus(input: {
  guestStatus: string;
  inviteTokenExpiresAt: Date | null | undefined;
  now?: Date;
}): InviteLinkStatus {
  if (input.guestStatus === "ARCHIVED") {
    return "archived";
  }

  if (input.inviteTokenExpiresAt) {
    const now = input.now ?? new Date();
    if (input.inviteTokenExpiresAt <= now) {
      return "expired";
    }
  }

  return "active";
}

export function formatInviteExpiry(
  expiresAt: Date | null | undefined,
): string | null {
  if (!expiresAt) {
    return null;
  }

  return expiresAt.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
