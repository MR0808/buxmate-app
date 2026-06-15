"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  Download,
  Mail,
  Phone,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { CopyInviteLinkButton } from "@/components/guests/copy-invite-link-button";
import { GuestImportDialog } from "@/components/guests/guest-import-dialog";
import { GuestStatusBadge } from "@/components/guests/guest-status-badge";
import { SendGuestInviteButton } from "@/components/emails/send-guest-invite-button";
import { bulkArchiveGuests } from "@/lib/actions/guest-bulk";
import { trackEvent } from "@/lib/analytics";
import {
  bulkSendGuestInviteEmails,
  bulkSendPaymentReminderEmails,
  bulkSendRsvpReminderEmails,
  type BulkEmailActionResult,
} from "@/lib/actions/emails";
import { formatMoney } from "@/lib/payments/format";
import { buildGuestInviteUrl } from "@/lib/guests/invite-url";
import type { GuestListItem } from "@/lib/guests/types";
import type { GuestSort, GuestStatusFilter } from "@/lib/guests/types";

type GuestListManagerProps = {
  eventId: string;
  guests: GuestListItem[];
  canManage: boolean;
  initialSearch?: string;
  initialStatus?: GuestStatusFilter;
  initialSort?: GuestSort;
};

type BulkAction = "invite" | "rsvp" | "payment" | "archive";

function bulkToast(action: BulkAction, result: BulkEmailActionResult | { success: true; processed: number }) {
  if (!result.success) {
    toast.error(result.error);
    return;
  }
  if ("processed" in result) {
    toast.success(`Archived ${result.processed} guest${result.processed === 1 ? "" : "s"}`);
    return;
  }
  const parts = [`${result.sent} sent`];
  if (result.failed > 0) parts.push(`${result.failed} failed`);
  if (result.skipped > 0) parts.push(`${result.skipped} skipped`);
  const label =
    action === "invite"
      ? "Invites"
      : action === "rsvp"
        ? "RSVP reminders"
        : "Payment reminders";
  toast.success(`${label}: ${parts.join(", ")}`);
}

export function GuestListManager({
  eventId,
  guests,
  canManage,
  initialSearch = "",
  initialStatus = "all",
  initialSort = "newest",
}: GuestListManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState(initialSearch);
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const status = (searchParams.get("status") as GuestStatusFilter) || initialStatus;
  const sort = (searchParams.get("sort") as GuestSort) || initialSort;

  const selectedIds = useMemo(() => [...selected], [selected]);
  const allSelected = guests.length > 0 && selected.size === guests.length;

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    startTransition(() => {
      router.push(`/events/${eventId}/guests?${params.toString()}`);
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(guests.map((guest) => guest.id)));
    }
  }

  function toggleGuest(guestId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(guestId)) next.delete(guestId);
      else next.add(guestId);
      return next;
    });
  }

  async function runBulkAction(action: BulkAction) {
    if (selectedIds.length === 0) {
      toast.error("Select at least one guest.");
      return;
    }

    setActionLoading(true);
    let result:
      | BulkEmailActionResult
      | { success: true; processed: number }
      | { success: false; error: string };

    switch (action) {
      case "invite":
        result = await bulkSendGuestInviteEmails(eventId, selectedIds);
        break;
      case "rsvp":
        result = await bulkSendRsvpReminderEmails(eventId, selectedIds);
        break;
      case "payment":
        result = await bulkSendPaymentReminderEmails(eventId, selectedIds);
        break;
      case "archive":
        result = await bulkArchiveGuests(eventId, selectedIds);
        break;
    }

    setActionLoading(false);
    setConfirmAction(null);

    if (action === "archive") {
      if (result.success && "processed" in result) {
        bulkToast(action, result);
        setSelected(new Set());
        router.refresh();
      } else if (!result.success) {
        toast.error(result.error);
      }
    } else {
      const emailResult = result as BulkEmailActionResult;
      if (
        action === "invite" &&
        emailResult.success &&
        emailResult.sent > 0
      ) {
        trackEvent("invite_email_sent", {
          event_category: "guest",
          source: "bulk",
          count: emailResult.sent,
        });
      }
      bulkToast(action, emailResult);
      if (emailResult.success) router.refresh();
    }
  }

  const confirmCopy: Record<BulkAction, { title: string; description: string }> = {
    invite: {
      title: "Send invites to selected guests?",
      description:
        "Emails go only to selected guests with an email address. Archived guests are skipped.",
    },
    rsvp: {
      title: "Send RSVP reminders?",
      description:
        "Guests with pending RSVPs and an email address will be reminded.",
    },
    payment: {
      title: "Send payment reminders?",
      description:
        "Guests with outstanding balances and an email address will be emailed.",
    },
    archive: {
      title: "Archive selected guests?",
      description:
        "Their invite links will stop working. You can still view them under archived filter.",
    },
  };

  return (
    <>
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  updateParams({ q: search.trim() || null });
                }
              }}
              placeholder="Search name, email, phone"
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="rounded-full normal-case tracking-normal"
            disabled={isPending}
            onClick={() => updateParams({ q: search.trim() || null })}
          >
            Search
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={status}
            onValueChange={(value) =>
              updateParams({ status: value as GuestStatusFilter })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="joined">Joined</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value) => updateParams({ sort: value as GuestSort })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="recent">Recently active</SelectItem>
            </SelectContent>
          </Select>

          {canManage ? <GuestImportDialog eventId={eventId} /> : null}
          <Button
            variant="outline"
            className="rounded-full normal-case tracking-normal"
            asChild
          >
            <a href={`/api/events/${eventId}/guests/export`} download>
              <Download className="size-4" aria-hidden />
              Export CSV
            </a>
          </Button>
        </div>
      </div>

      {canManage && selected.size > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium">{selected.size} selected</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full normal-case tracking-normal"
            onClick={() => setConfirmAction("invite")}
          >
            Send invites
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full normal-case tracking-normal"
            onClick={() => setConfirmAction("rsvp")}
          >
            RSVP reminder
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full normal-case tracking-normal"
            onClick={() => setConfirmAction("payment")}
          >
            Payment reminder
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="rounded-full normal-case tracking-normal"
            onClick={() => setConfirmAction("archive")}
          >
            Archive
          </Button>
        </div>
      ) : null}

      <div className="mt-6">
        {guests.length > 0 ? (
          <div className="space-y-3">
            {canManage ? (
              <div className="flex items-center gap-2 px-1">
                <Checkbox
                  id="select-all-guests"
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                />
                <Label htmlFor="select-all-guests" className="text-sm font-normal">
                  Select all on this page
                </Label>
              </div>
            ) : null}

            {guests.map((guest) => {
              const inviteUrl = buildGuestInviteUrl(guest.inviteToken);
              const isArchived = guest.status === "ARCHIVED";

              return (
                <div key={guest.id} className="buxmate-card p-5 sm:p-6">
                  <div className="flex gap-3">
                    {canManage ? (
                      <Checkbox
                        checked={selected.has(guest.id)}
                        onCheckedChange={() => toggleGuest(guest.id)}
                        className="mt-1"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <GuestStatusBadge status={guest.status} />
                            {guest.hasPendingRsvp ? (
                              <span className="text-xs text-amber-700 dark:text-amber-400">
                                RSVP pending
                              </span>
                            ) : null}
                          </div>
                          <Link
                            href={`/events/${eventId}/guests/${guest.id}`}
                            className="mt-2 block font-heading text-lg font-semibold hover:text-primary"
                          >
                            {guest.name}
                          </Link>
                          {guest.email ? (
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Mail className="size-3.5 shrink-0" aria-hidden />
                              {guest.email}
                            </p>
                          ) : null}
                          {guest.phone ? (
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="size-3.5 shrink-0" aria-hidden />
                              {guest.phone}
                            </p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>
                              RSVP: {guest.rsvpSummary.going} going ·{" "}
                              {guest.rsvpSummary.pending} pending
                            </span>
                            {guest.paymentSummary.owed > 0 ? (
                              <span>
                                Payments: {formatMoney(guest.paymentSummary.outstanding)} owing
                              </span>
                            ) : null}
                            {guest.lastAccessedAt ? (
                              <span>
                                Last opened{" "}
                                {guest.lastAccessedAt.toLocaleDateString("en-AU", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            ) : (
                              <span>Never opened invite</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                          {!isArchived ? (
                            <>
                              <CopyInviteLinkButton inviteUrl={inviteUrl} />
                              <SendGuestInviteButton
                                eventId={eventId}
                                guestId={guest.id}
                                guestEmail={guest.email}
                              />
                            </>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full normal-case tracking-normal"
                            asChild
                          >
                            <Link href={`/events/${eventId}/guests/${guest.id}`}>
                              Open
                              <ArrowRight className="size-4" aria-hidden />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={
              initialSearch || initialStatus !== "all"
                ? "No guests match"
                : "No guests yet"
            }
            description={
              initialSearch || initialStatus !== "all"
                ? "Try a different search or filter, or import guests from CSV."
                : "Invite your first guest and share their private link."
            }
          />
        )}
      </div>

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        {confirmAction ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmCopy[confirmAction].title}</DialogTitle>
              <DialogDescription>
                {confirmCopy[confirmAction].description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full normal-case tracking-normal"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-full normal-case tracking-normal"
                disabled={actionLoading}
                onClick={() => runBulkAction(confirmAction)}
              >
                {actionLoading ? "Working..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
