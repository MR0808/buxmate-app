"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EventNavProps = {
  eventId: string;
};

const navItems = [
  { href: "", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/activities", label: "Activities", icon: CalendarDays },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/feed", label: "Feed", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function EventNav({ eventId }: EventNavProps) {
  const pathname = usePathname();
  const basePath = `/events/${eventId}`;

  return (
    <>
      <nav className="hidden gap-1 md:flex">
        {navItems.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = item.exact
            ? pathname === href
            : pathname.startsWith(href) && item.href !== "";

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-6xl justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const href = `${basePath}${item.href}`;
            const isActive = item.exact
              ? pathname === href
              : pathname.startsWith(href) && item.href !== "";

            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px]",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
