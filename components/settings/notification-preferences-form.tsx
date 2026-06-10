"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { updateNotificationPreferences } from "@/lib/actions/settings";

type NotificationPreferencesFormProps = {
  initial: {
    notifyRsvpUpdates: boolean;
    notifyGuestJoins: boolean;
    notifyPaymentUpdates: boolean;
  };
};

export function NotificationPreferencesForm({
  initial,
}: NotificationPreferencesFormProps) {
  const router = useRouter();
  const [prefs, setPrefs] = useState(initial);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const result = await updateNotificationPreferences(prefs);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Notification preferences saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Email notifications for your events. More delivery options coming later.
      </p>
      <div className="space-y-3">
        <label className="flex items-start gap-3">
          <Checkbox
            checked={prefs.notifyGuestJoins}
            onCheckedChange={(checked) =>
              setPrefs((p) => ({ ...p, notifyGuestJoins: checked === true }))
            }
          />
          <span className="text-sm">
            <span className="font-medium">Guest joins</span>
            <span className="mt-0.5 block text-muted-foreground">
              When a guest opens their invite and joins the event.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <Checkbox
            checked={prefs.notifyRsvpUpdates}
            onCheckedChange={(checked) =>
              setPrefs((p) => ({ ...p, notifyRsvpUpdates: checked === true }))
            }
          />
          <span className="text-sm">
            <span className="font-medium">RSVP updates</span>
            <span className="mt-0.5 block text-muted-foreground">
              When guests respond to activities.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <Checkbox
            checked={prefs.notifyPaymentUpdates}
            onCheckedChange={(checked) =>
              setPrefs((p) => ({ ...p, notifyPaymentUpdates: checked === true }))
            }
          />
          <span className="text-sm">
            <span className="font-medium">Payment updates</span>
            <span className="mt-0.5 block text-muted-foreground">
              When you mark guests as paid or update payment items.
            </span>
          </span>
        </label>
      </div>
      <Button
        type="submit"
        className="rounded-full normal-case tracking-normal"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Save preferences"}
      </Button>
    </form>
  );
}
