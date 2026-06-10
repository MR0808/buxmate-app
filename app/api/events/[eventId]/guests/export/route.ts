import { NextResponse } from "next/server";
import { buildGuestExportCsv } from "@/lib/guests/csv";
import { getGuestExportRows } from "@/lib/guests/queries";
import { getOrganiserEvent } from "@/lib/events";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  try {
    const event = await getOrganiserEvent(eventId);
    const rows = await getGuestExportRows(eventId);
    const csv = buildGuestExportCsv(rows);
    const filename = `${event.slug}-guests.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
