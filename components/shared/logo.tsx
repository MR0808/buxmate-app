import Image from "next/image";
import Link from "next/link";
import {
  LOGO_DIMENSIONS,
  LOGO_ONLY_DIMENSIONS,
  LOGO_ONLY_PATH,
  LOGO_PATH,
} from "@/lib/brand";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  iconClassName?: string;
  wordmarkClassName?: string;
  /** Sidebar mark — logo only, no wordmark in the image file */
  markOnly?: boolean;
};

export function Logo({
  className,
  showWordmark = true,
  iconClassName,
  wordmarkClassName,
  markOnly = false,
}: LogoProps) {
  const markSrc = markOnly ? LOGO_ONLY_PATH : LOGO_PATH;
  const { width, height } = markOnly ? LOGO_ONLY_DIMENSIONS : LOGO_DIMENSIONS;

  return (
    <Link
      href="/"
      aria-label="Buxmate home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <Image
        src={markSrc}
        alt=""
        width={width}
        height={height}
        priority
        className={cn("h-9 w-auto shrink-0", iconClassName)}
        style={{ width: "auto" }}
      />
      {showWordmark ? (
        <span
          className={cn(
            "text-xl font-semibold tracking-tight text-foreground",
            wordmarkClassName,
          )}
        >
          Buxmate
        </span>
      ) : null}
    </Link>
  );
}
