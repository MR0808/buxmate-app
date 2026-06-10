import { z } from "zod";
import { createGuestSchema } from "@/lib/validations/guest";

export const bulkGuestIdsSchema = z
  .array(z.string().min(1))
  .min(1, "Select at least one guest")
  .max(500, "Too many guests selected");

export const importGuestsSchema = z
  .array(createGuestSchema)
  .min(1, "No valid guests to import")
  .max(500, "Import limit is 500 guests at a time");

export type ImportGuestsInput = z.infer<typeof importGuestsSchema>;
