import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Camera,
  CreditCard,
  ListTodo,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type QuickActionsGridProps = {
  eventId: string;
  canManage: boolean;
};

const actions: {
  label: string;
  description: string;
  href: (eventId: string) => string;
  icon: LucideIcon;
}[] = [
  {
    label: "Add activity",
    description: "Schedule something new",
    href: (id) => `/events/${id}/activities/new`,
    icon: ListTodo,
  },
  {
    label: "Add guest",
    description: "Send a private invite",
    href: (id) => `/events/${id}/guests/new`,
    icon: UserPlus,
  },
  {
    label: "Post update",
    description: "Share news with guests",
    href: (id) => `/events/${id}/feed`,
    icon: MessageSquare,
  },
  {
    label: "Add payment",
    description: "Track who owes what",
    href: (id) => `/events/${id}/payments/new`,
    icon: CreditCard,
  },
  {
    label: "Upload photo",
    description: "Add to the gallery",
    href: (id) => `/events/${id}/photos`,
    icon: Camera,
  },
];

export function QuickActionsGrid({ eventId, canManage }: QuickActionsGridProps) {
  if (!canManage) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="font-heading text-lg font-semibold">Quick actions</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The most common things organisers do from here.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href(eventId)}
            className={cn(
              "buxmate-card group flex flex-col p-5 transition-shadow hover:shadow-md",
            )}
          >
            <action.icon
              className="size-5 text-primary transition-transform group-hover:scale-110"
              aria-hidden
            />
            <p className="mt-3 font-medium">{action.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
