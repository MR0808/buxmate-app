import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type EventFeatureCardProps = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  className?: string;
};

export function EventFeatureCard({
  href,
  title,
  description,
  icon: Icon,
  comingSoon = false,
  className,
}: EventFeatureCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "buxmate-card group flex flex-col p-5 transition-shadow hover:shadow-md",
        comingSoon && "opacity-90",
        className,
      )}
    >
      <Icon className="size-5 text-primary" aria-hidden />
      <h3 className="mt-3 font-heading text-base font-semibold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        {comingSoon ? "Coming soon" : "Open"}
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
