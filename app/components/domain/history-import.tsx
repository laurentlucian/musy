import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, Music2, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, useRevalidator } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { ImportMessage, ImportProgress } from "~/lib/history-parser";

function restoreImport(progress: ImportProgress | null): ImportMessage | null {
  if (!progress) return null;
  return {
    progress,
    phase:
      progress.status === "complete"
        ? "complete"
        : progress.status === "processing"
          ? "processing"
          : "error",
    error:
      progress.status === "running"
        ? "Upload interrupted. Choose your files again. Saved listens won’t duplicate."
        : undefined,
  };
}

export function HistoryImport({
  initialImport,
}: {
  initialImport: ImportProgress | null;
}) {
  const [open, setOpen] = useState(
    Boolean(initialImport && initialImport.status !== "complete"),
  );
  const reduceMotion = useReducedMotion();
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ImportMessage | null>(() =>
    restoreImport(initialImport),
  );
  const jobId = useRef<string | null>(null);
  const worker = useRef<Worker | null>(null);
  const revalidator = useRevalidator();
  const uploading = state?.phase === "reading" || state?.phase === "uploading";
  const processing = state?.phase === "processing";
  const busy = uploading || processing;
  const [pollError, setPollError] = useState<string | null>(null);
  const savedJob = state?.progress?.jobId;
  const shouldPoll =
    !uploading && (state?.progress?.status === "running" || processing);
  useEffect(() => {
    if (!shouldPoll) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const response = await fetch("/resources/history-import", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Couldn’t check progress. Retrying…");
        const result = (await response.json()) as {
          import: ImportProgress | null;
          error?: string;
        };
        if (result.error) throw new Error(result.error);
        if (controller.signal.aborted) return;
        setPollError(null);
        setState(restoreImport(result.import));
        if (!result.import || result.import.status === "complete") {
          void revalidator.revalidate();
          return;
        }
      } catch {
        if (controller.signal.aborted) return;
        setPollError("Couldn’t check progress. Retrying…");
      }
      timer = setTimeout(poll, 5000);
    };
    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [shouldPoll, savedJob, revalidator]);
  useEffect(() => () => worker.current?.terminate(), []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <div className="space-y-3">
        <h2 className="font-semibold">Import history</h2>
        <p className="text-muted-foreground text-sm">
          Bring your Spotify listening history into Musy.
        </p>
        <DialogPrimitive.Trigger asChild>
          <Button>{state ? "View import" : "Import history"}</Button>
        </DialogPrimitive.Trigger>
      </div>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex h-dvh flex-col overflow-y-auto bg-background text-foreground outline-none">
          <header className="flex items-center justify-between px-6 py-5 sm:px-10">
            <span className="font-semibold text-sm">
              Musy{" "}
              <span className="ml-3 font-normal text-muted-foreground">
                / Import history
              </span>
            </span>
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={busy ? "Minimize import" : "Close import"}
              >
                <X className="size-5" />
              </Button>
            </DialogPrimitive.Close>
          </header>
          <main className="m-auto flex w-full max-w-xl flex-col items-center px-6 py-10 text-center">
            <motion.div
              aria-hidden="true"
              animate={busy && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
              transition={
                busy && !reduceMotion
                  ? { duration: 12, repeat: Infinity, ease: "linear" }
                  : { duration: 0.4 }
              }
              className="relative mb-10 flex size-48 shrink-0 items-center justify-center rounded-full border border-border bg-muted sm:size-64"
              style={{
                backgroundImage:
                  "repeating-radial-gradient(circle at center, transparent 0px, transparent 5px, rgb(255 255 255 / 0.035) 6px, transparent 7px)",
              }}
            >
              <div className="flex size-20 items-center justify-center rounded-full border border-border bg-background sm:size-24">
                {state?.phase === "complete" ? (
                  <Check className="size-8" />
                ) : (
                  <Music2 className="size-8" />
                )}
              </div>
            </motion.div>
            <div className="w-full space-y-6">
              <div>
                <DialogPrimitive.Title className="font-semibold text-3xl tracking-tight sm:text-4xl">
                  {state?.phase === "complete"
                    ? "Your history is here."
                    : busy
                      ? "Bringing it all back."
                      : state?.phase === "error"
                        ? "Let’s pick up here."
                        : "Every listen. Back with you."}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-3 text-muted-foreground text-sm">
                  {processing
                    ? "Building your listening stats. You can close this page."
                    : busy
                      ? "Keep this page open as your listening history arrives."
                      : state?.phase === "complete"
                        ? "Explore the music you’ve spent time with."
                        : "Choose your Spotify Extended streaming history ZIP or JSON files."}
                </DialogPrimitive.Description>
              </div>
              {!busy && state?.phase !== "complete" && (
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
                    setPollError(null);
                  }}
                />
              )}
              {!state && (
                <p className="text-muted-foreground text-xs">
                  IP and device history stays private. Map locations are
                  approximate.
                </p>
              )}
              {state?.phase !== "complete" && (
                <Button
                  disabled={busy || !files.length}
                  onClick={() => {
                    worker.current?.terminate();
                    jobId.current ??= crypto.randomUUID();
                    const next = new Worker(
                      new URL(
                        "../../lib/history-import.worker.ts",
                        import.meta.url,
                      ),
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
                      if (
                        event.data.phase === "complete" ||
                        event.data.phase === "processing"
                      ) {
                        next.terminate();
                        worker.current = null;
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
                  {busy
                    ? "Importing…"
                    : state?.phase === "error"
                      ? "Retry"
                      : "Import"}
                </Button>
              )}
              {state && (
                <div className="space-y-2 text-sm" aria-live="polite">
                  <p>
                    {state.phase === "complete"
                      ? "History imported"
                      : state.phase === "processing"
                        ? "Building listening stats…"
                        : state.phase === "error"
                          ? "Import paused"
                          : `${state.phase === "reading" ? "Reading" : "Importing"} ${state.file ?? "files"}…`}
                  </p>
                  {uploading && (
                    <p className="text-muted-foreground text-xs">
                      Keep this page open. Reimporting won’t duplicate listens.
                    </p>
                  )}
                  {processing && (
                    <progress
                      aria-label="Building listening stats"
                      className="h-1 w-full accent-primary"
                    />
                  )}
                  {pollError && (
                    <output className="block text-muted-foreground text-xs">
                      {pollError}
                    </output>
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
                    <div className="py-4">
                      <p className="font-semibold text-5xl tabular-nums tracking-tight sm:text-6xl">
                        {state.progress.imported.toLocaleString()}
                      </p>
                      <p className="mt-2 text-muted-foreground text-sm">
                        listens imported
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {state.progress.imported.toLocaleString()} imported ·{" "}
                        {state.progress.duplicates.toLocaleString()} duplicates
                        · {state.progress.skipped.toLocaleString()} skipped
                        (including podcasts)
                      </p>
                    </div>
                  )}
                  {state.error && (
                    <p role="alert" className="text-destructive">
                      {state.error}
                    </p>
                  )}
                  {state.phase === "complete" && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setState(null);
                        setFiles([]);
                        jobId.current = null;
                      }}
                    >
                      Import more
                    </Button>
                  )}
                  {state.phase === "complete" && (
                    <Button asChild variant="link" className="px-0">
                      <Link to="/explore">View listening</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </main>
          <footer className="px-6 py-5 text-center text-muted-foreground text-xs">
            {processing
              ? "Progress is saved. You can close this page."
              : busy
                ? "You can minimize this view. Keep the tab open."
                : "Your music. Your history."}
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
