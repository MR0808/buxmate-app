import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

type DashboardSectionProps = {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  empty?: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: { label: string; href: string };
  };
  children?: React.ReactNode;
  className?: string;
};

export function DashboardSection({
  title,
  description,
  action,
  empty,
  children,
  className,
}: DashboardSectionProps) {
  const hasContent = Boolean(children);

  return (
    <section className={cn("mt-8", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full normal-case tracking-normal"
            asChild
          >
            <Link href={action.href}>
              {action.label}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </Button>
        ) : null}
      </div>

      {hasContent ? (
        <div className="mt-4">{children}</div>
      ) : empty ? (
        <EmptyState
          className="mt-4"
          icon={empty.icon}
          title={empty.title}
          description={empty.description}
          action={
            empty.action ? (
              <Button
                className="mt-2 rounded-full normal-case tracking-normal"
                asChild
              >
                <Link href={empty.action.href}>{empty.action.label}</Link>
              </Button>
            ) : undefined
          }
        />
      ) : null}
    </section>
  );
}
