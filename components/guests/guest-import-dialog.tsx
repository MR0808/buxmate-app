"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { importGuests } from "@/lib/actions/guest-bulk";
import { trackEvent } from "@/lib/analytics";
import { parseGuestCsv } from "@/lib/guests/csv";
import { createGuestSchema } from "@/lib/validations/guest";

type GuestImportDialogProps = {
  eventId: string;
  disabled?: boolean;
};

export function GuestImportDialog({ eventId, disabled }: GuestImportDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [csvText, setCsvText] = useState("");

  const preview = useMemo(() => {
    if (!csvText.trim()) return null;
    const parsed = parseGuestCsv(csvText);
    const validated = parsed.rows.map((row) => {
      if (row.error || !row.data) return row;
      const result = createGuestSchema.safeParse(row.data);
      if (!result.success) {
        return {
          ...row,
          error: result.error.issues[0]?.message ?? "Invalid row",
          data: undefined,
        };
      }
      return { ...row, data: result.data };
    });

    const valid = validated
      .filter((row) => row.data)
      .map((row) => row.data!);

    return {
      rows: validated,
      valid,
      invalidCount: validated.filter((row) => row.error).length,
    };
  }, [csvText]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  }

  async function handleImport() {
    if (!preview || preview.valid.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }

    setIsLoading(true);
    const result = await importGuests(eventId, preview.valid);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (result.imported > 0) {
      trackEvent("guest_added", {
        event_category: "guest",
        source: "import",
        count: result.imported,
      });
    }

    toast.success(
      `Imported ${result.imported} guest${result.imported === 1 ? "" : "s"}${
        result.skipped > 0 ? ` · ${result.skipped} skipped` : ""
      }`,
    );
    setOpen(false);
    setCsvText("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="rounded-full normal-case tracking-normal"
          disabled={disabled}
        >
          <Upload className="size-4" aria-hidden />
          Import guests
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import guests from CSV</DialogTitle>
          <DialogDescription>
            Required column: name. Optional: email, phone. Example:
            name,email,phone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
          {preview ? (
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
              <p className="font-medium">
                {preview.valid.length} ready to import
                {preview.invalidCount > 0
                  ? ` · ${preview.invalidCount} invalid`
                  : ""}
              </p>
              <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                {preview.rows.slice(0, 20).map((row) => (
                  <li
                    key={row.rowNumber}
                    className={
                      row.error ? "text-destructive" : "text-muted-foreground"
                    }
                  >
                    Row {row.rowNumber}:{" "}
                    {row.error ??
                      `${row.data?.name}${row.data?.email ? ` · ${row.data.email}` : ""}`}
                  </li>
                ))}
              </ul>
              {preview.rows.length > 20 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Showing first 20 rows.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-full normal-case tracking-normal"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-full normal-case tracking-normal"
            disabled={isLoading || !preview || preview.valid.length === 0}
            onClick={handleImport}
          >
            {isLoading ? "Importing..." : "Import guests"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
