import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
        B
      </span>
      {showWordmark ? (
        <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Buxmate
        </span>
      ) : null}
    </Link>
  );
}
