import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";
import {
  historyBatches,
  parseHistory,
  type ImportMessage,
} from "./history-parser";

const report = (message: ImportMessage) => self.postMessage(message);

self.onmessage = async (
  event: MessageEvent<{ files: File[]; jobId: string }>,
) => {
  const { files, jobId } = event.data;
  let batchId = 0;
  let found = 0;
  try {
    const submit = async (body: object) => {
      const response = await fetch("/resources/history-import", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(
          response.status === 401 || response.redirected
            ? "Sign in again, then retry the import."
            : `Upload failed (${response.status}). Retry to continue.`,
        );
      }
      const result = (await response.json()) as {
        import?: ImportMessage["progress"];
        error?: string;
      };
      if (!response.ok || result.error) {
        throw new Error(
          result.error ||
            `Upload failed (${response.status}). Retry to continue.`,
        );
      }
      return result.import;
    };
    const consume = async (text: string, name: string) => {
      const rows = parseHistory(text, name);
      found += rows.length;
      let processed = 0;
      for (const batch of historyBatches(rows)) {
        const progress = await submit({
          action: "batch",
          jobId,
          batchId: String(batchId++),
          rows: batch,
        });
        processed += batch.length;
        report({
          phase: "uploading",
          file: name,
          processed,
          total: rows.length,
          progress,
        });
      }
    };
    for (const file of files) {
      report({ phase: "reading", file: file.name });
      if (/\.zip$/i.test(file.name)) {
        const reader = new ZipReader(new BlobReader(file));
        try {
          for (const entry of await reader.getEntries()) {
            if (
              entry.directory ||
              !/\.json$/i.test(entry.filename) ||
              entry.filename.startsWith("__MACOSX/")
            )
              continue;
            report({ phase: "reading", file: entry.filename });
            if (entry.uncompressedSize > 100_000_000)
              throw new Error(`${entry.filename}: file exceeds 100 MB.`);
            await consume(
              await entry.getData(new TextWriter()),
              entry.filename,
            );
          }
        } finally {
          await reader.close();
        }
      } else if (/\.json$/i.test(file.name)) {
        if (file.size > 100_000_000)
          throw new Error(`${file.name}: file exceeds 100 MB.`);
        await consume(await file.text(), file.name);
      } else {
        throw new Error("Choose a ZIP or JSON export.");
      }
    }
    if (!found) throw new Error("No listening records found in these files.");
    const progress = await submit({ action: "complete", jobId });
    report({
      phase: progress?.status === "complete" ? "complete" : "processing",
      progress,
    });
  } catch (error) {
    report({
      phase: "error",
      error:
        error instanceof Error
          ? error.message
          : "Import failed. Retry to continue.",
    });
  }
};
