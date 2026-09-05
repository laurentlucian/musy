export type HistoryRow = Record<string, unknown>;

export function parseHistory(text: string, name: string): HistoryRow[] {
  let rows: unknown;
  try {
    rows = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    throw new Error(`${name}: invalid JSON.`);
  }
  if (!Array.isArray(rows)) throw new Error(`${name}: expected a JSON array.`);
  if (
    rows.some((row) => !row || typeof row !== "object" || Array.isArray(row))
  ) {
    throw new Error(`${name}: contains invalid listening records.`);
  }
  if (rows.length && !rows.some((row) => "ts" in row && "ms_played" in row)) {
    throw new Error(
      `${name}: use Spotify’s Extended streaming history export.`,
    );
  }
  return rows;
}

export function* historyBatches(rows: HistoryRow[]) {
  let batch: HistoryRow[] = [];
  let bytes = 2;
  for (const row of rows) {
    const size = new TextEncoder().encode(JSON.stringify(row)).length + 1;
    if (size > 250_000)
      throw new Error("A listening record exceeds the upload limit.");
    if (batch.length && (batch.length >= 100 || bytes + size > 250_000)) {
      yield batch;
      batch = [];
      bytes = 2;
    }
    batch.push(row);
    bytes += size;
  }
  if (batch.length) yield batch;
}

export type ImportProgress = {
  jobId: string;
  status: string;
  imported: number;
  duplicates: number;
  skipped: number;
};
export type ImportMessage = {
  phase: "reading" | "uploading" | "complete" | "error";
  file?: string;
  processed?: number;
  total?: number;
  progress?: ImportProgress;
  error?: string;
};
