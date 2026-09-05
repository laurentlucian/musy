import { useEffect, useRef, useState } from "react";
import { Link, useRevalidator } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { ImportMessage } from "~/lib/history-parser";

export function HistoryImport() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ImportMessage | null>(null);
  const jobId = useRef<string | null>(null);
  const worker = useRef<Worker | null>(null);
  const revalidator = useRevalidator();
  const busy = state?.phase === "reading" || state?.phase === "uploading";
  useEffect(() => () => worker.current?.terminate(), []);

  return (
    <section
      className="max-w-xl space-y-4"
      aria-labelledby="history-import-title"
    >
      <div>
        <h2 id="history-import-title" className="font-semibold">
          Import history
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Choose your Spotify Extended streaming history ZIP or JSON files.
        </p>
      </div>
      <Input
        aria-label="Spotify history files"
        type="file"
        accept=".zip,.json,application/zip,application/json"
        multiple
        disabled={busy}
        onChange={(event) => {
          setFiles(Array.from(event.target.files ?? []));
          jobId.current = null;
          setState(null);
        }}
      />
      <p className="text-muted-foreground text-xs">
        IP and device history stays private. Map locations are approximate.
      </p>
      <Button
        disabled={busy || !files.length}
        onClick={() => {
          worker.current?.terminate();
          jobId.current ??= crypto.randomUUID();
          const next = new Worker(
            new URL("../../lib/history-import.worker.ts", import.meta.url),
            { type: "module" },
          );
          worker.current = next;
          setState((previous) => ({
            ...previous,
            phase: "reading",
            error: undefined,
          }));
          next.onmessage = (event: MessageEvent<ImportMessage>) => {
            setState((previous) => ({ ...previous, ...event.data }));
            if (event.data.phase === "complete") {
              next.terminate();
              void revalidator.revalidate();
            }
          };
          next.onerror = () =>
            setState((previous) => ({
              ...previous,
              phase: "error",
              error: "Import stopped. Retry to continue.",
            }));
          next.postMessage({ files, jobId: jobId.current });
        }}
      >
        {busy ? "Importing…" : state?.phase === "error" ? "Retry" : "Import"}
      </Button>
      {state && (
        <div className="space-y-2 text-sm" aria-live="polite">
          <p>
            {state.phase === "complete"
              ? "History imported"
              : state.phase === "error"
                ? "Import paused"
                : `${state.phase === "reading" ? "Reading" : "Importing"} ${state.file ?? "files"}…`}
          </p>
          {busy && (
            <p className="text-muted-foreground text-xs">
              Keep this page open. Reimporting won’t duplicate listens.
            </p>
          )}
          {state.phase === "uploading" && (
            <progress
              aria-label="Current file progress"
              className="h-1 w-full accent-primary"
              value={state.processed}
              max={state.total || 1}
            />
          )}
          {state.progress && (
            <p className="text-muted-foreground text-xs">
              {state.progress.imported.toLocaleString()} imported ·{" "}
              {state.progress.duplicates.toLocaleString()} duplicates ·{" "}
              {state.progress.skipped.toLocaleString()} skipped (including
              podcasts)
            </p>
          )}
          {state.error && (
            <p role="alert" className="text-destructive">
              {state.error}
            </p>
          )}
          {state.phase === "complete" && (
            <Button asChild variant="link" className="px-0">
              <Link to="/history">View listening</Link>
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
