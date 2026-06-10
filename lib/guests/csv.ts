import type { CreateGuestInput } from "@/lib/validations/guest";

export type CsvParseRow = {
  rowNumber: number;
  raw: Record<string, string>;
  data?: CreateGuestInput;
  error?: string;
};

export type CsvParseResult = {
  rows: CsvParseRow[];
  valid: CreateGuestInput[];
  invalidCount: number;
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normaliseHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, "");
}

export function parseGuestCsv(content: string): CsvParseResult {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return { rows: [], valid: [], invalidCount: 0 };
  }

  const headers = parseCsvLine(lines[0]).map(normaliseHeader);
  const nameIndex = headers.indexOf("name");
  const emailIndex = headers.indexOf("email");
  const phoneIndex = headers.indexOf("phone");

  if (nameIndex === -1) {
    return {
      rows: [
        {
          rowNumber: 1,
          raw: {},
          error: "CSV must include a name column.",
        },
      ],
      valid: [],
      invalidCount: 1,
    };
  }

  const rows: CsvParseRow[] = [];
  const valid: CreateGuestInput[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const raw: Record<string, string> = {
      name: values[nameIndex] ?? "",
      email: emailIndex >= 0 ? (values[emailIndex] ?? "") : "",
      phone: phoneIndex >= 0 ? (values[phoneIndex] ?? "") : "",
    };

    const rowNumber = i + 1;

    if (!raw.name.trim()) {
      rows.push({
        rowNumber,
        raw,
        error: "Name is required.",
      });
      continue;
    }

    const data: CreateGuestInput = {
      name: raw.name.trim(),
      email: raw.email.trim() || "",
      phone: raw.phone.trim() || "",
    };

    rows.push({ rowNumber, raw, data });
    valid.push(data);
  }

  return {
    rows,
    valid,
    invalidCount: rows.filter((row) => row.error).length,
  };
}

export function escapeCsvValue(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildGuestExportCsv(
  rows: {
    name: string;
    email: string;
    phone: string;
    status: string;
    joinedDate: string;
    rsvpSummary: string;
    paymentSummary: string;
  }[],
) {
  const header = [
    "name",
    "email",
    "phone",
    "status",
    "joined_date",
    "rsvp_summary",
    "payment_summary",
  ];

  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        escapeCsvValue(row.name),
        escapeCsvValue(row.email),
        escapeCsvValue(row.phone),
        escapeCsvValue(row.status),
        escapeCsvValue(row.joinedDate),
        escapeCsvValue(row.rsvpSummary),
        escapeCsvValue(row.paymentSummary),
      ].join(","),
    ),
  ];

  return lines.join("\n");
}
