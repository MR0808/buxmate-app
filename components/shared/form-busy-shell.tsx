import { cn } from "@/lib/utils";

type FormBusyShellProps = {
  busy: boolean;
  className?: string;
  children: React.ReactNode;
};

export function FormBusyShell({
  busy,
  className,
  children,
}: FormBusyShellProps) {
  return (
    <fieldset
      disabled={busy}
      className={cn(
        "m-0 min-w-0 border-0 p-0",
        busy && "pointer-events-none opacity-60",
        className,
      )}
    >
      {children}
    </fieldset>
  );
}
