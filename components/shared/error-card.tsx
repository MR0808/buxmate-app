import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
  className?: string;
};

export function ErrorCard({
  icon: Icon,
  title,
  description,
  action,
  className,
}: ErrorCardProps) {
  return (
    <div
      className={cn(
        "buxmate-card flex flex-col items-center px-6 py-12 text-center sm:px-8",
        className,
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <Icon className="size-6" aria-hidden />
      </div>
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? (
        <Button
          className="mt-6 rounded-full normal-case tracking-normal"
          asChild
        >
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
