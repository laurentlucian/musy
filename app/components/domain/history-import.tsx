import { Check, Music2 } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, useRevalidator } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { ImportMessage, ImportProgress } from "~/lib/history-parser";
import { useRecordSpin } from "./use-record-spin";

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

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;
const reveal = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring },
};

function Count({ value, instant }: { value: number; instant: boolean }) {
  const count = useMotionValue(instant ? value : 0);
  const text = useTransform(count, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    if (instant) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, instant, count]);
  return <motion.span>{text}</motion.span>;
}

export function HistoryImport({
  initialImport,
}: {
  initialImport: ImportProgress | null;
}) {
  const reduceMotion = useReducedMotion();
  const { transform, ...spinEvents } = useRecordSpin(!!reduceMotion);
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
    <main className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-10 text-center">
      <motion.div
        aria-hidden="true"
        {...spinEvents}
        className="relative mb-10 flex size-48 shrink-0 touch-none select-none items-center justify-center rounded-full cursor-grab active:cursor-grabbing shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.12)] sm:size-64"
        style={{
          transform,
          backgroundImage: [
            "conic-gradient(from 210deg at 50% 50%, rgb(255 255 255 / 0.16) 0deg, transparent 40deg, transparent 160deg, rgb(255 255 255 / 0.1) 200deg, transparent 240deg, transparent 330deg, rgb(255 255 255 / 0.16) 360deg)",
            "repeating-radial-gradient(circle at center, rgb(255 255 255 / 0.06) 0px, rgb(255 255 255 / 0.06) 1px, transparent 1.5px, transparent 4px)",
            "radial-gradient(circle at center, #1b1b1f 0%, #111114 55%, #050506 100%)",
          ].join(","),
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.12), transparent 45%)",
          }}
        />
        <div
          className="relative flex size-20 items-center justify-center rounded-full text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2),0_0_0_3px_#0a0a0c,0_0_40px_-8px_rgb(255_120_60/0.6)] sm:size-24"
          style={{
            background:
              state?.phase === "complete"
                ? "conic-gradient(from 0deg, #ff5f6d, #ffc371, #2bd2ff, #a05cff, #ff5f6d)"
                : "conic-gradient(from 0deg, #ff7a18, #ff2d95, #7b2ff7, #ff7a18)",
          }}
        >
          <div className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.35),transparent_55%)]" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={state?.phase === "complete" ? "check" : "music"}
              initial={
                reduceMotion ? false : { scale: 0.4, opacity: 0, rotate: -30 }
              }
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={
                reduceMotion
                  ? undefined
                  : { scale: 0.4, opacity: 0, rotate: 30 }
              }
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="relative flex"
            >
              {state?.phase === "complete" ? (
                <Check className="size-8 drop-shadow" strokeWidth={2.5} />
              ) : (
                <Music2 className="size-8 drop-shadow" strokeWidth={2.5} />
              )}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
      <motion.div layout={!reduceMotion} className="w-full space-y-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={state?.phase ?? "idle"}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <h1 className="text-balance font-semibold text-4xl leading-none tracking-[-0.035em] sm:text-5xl">
              {state?.phase === "complete"
                ? "Your history is here."
                : busy
                  ? "Bringing it all back."
                  : state?.phase === "error"
                    ? "Let’s pick up here."
                    : "Every listen. Back with you."}
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-pretty text-base text-muted-foreground leading-snug">
              {processing
                ? "Building your listening stats. You can close this page."
                : busy
                  ? "Keep this page open as your listening history arrives."
                  : state?.phase === "complete"
                    ? "Explore the music you’ve spent time with."
                    : "Choose your Spotify Extended streaming history ZIP or JSON files."}
            </p>
          </motion.div>
        </AnimatePresence>
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
            IP and device history stays private.
          </p>
        )}
        {state?.phase !== "complete" && (
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
          <motion.div
            key={state.phase === "complete" ? "complete" : "active"}
            variants={
              reduceMotion
                ? undefined
                : { shown: { transition: { staggerChildren: 0.08 } } }
            }
            initial="hidden"
            animate="shown"
            className="space-y-2 text-sm"
            aria-live="polite"
          >
            <motion.p
              variants={reduceMotion ? undefined : reveal}
              className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.18em]"
            >
              {state.phase === "complete"
                ? "History imported"
                : state.phase === "processing"
                  ? "Building listening stats…"
                  : state.phase === "error"
                    ? "Import paused"
                    : `${state.phase === "reading" ? "Reading" : "Importing"} ${state.file ?? "files"}…`}
            </motion.p>
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
              <motion.div
                variants={reduceMotion ? undefined : reveal}
                className="py-3"
              >
                <p className="font-semibold text-7xl tabular-nums leading-none tracking-[-0.045em] sm:text-8xl">
                  <Count
                    value={state.progress.imported}
                    instant={Boolean(reduceMotion)}
                  />
                </p>
                <p className="mt-3 text-base text-muted-foreground">listens</p>
                <motion.dl
                  variants={reduceMotion ? undefined : reveal}
                  className="mt-5 flex justify-center gap-6 text-xs"
                >
                  {[
                    ["duplicates", state.progress.duplicates],
                    ["skipped", state.progress.skipped],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-baseline gap-1.5">
                      <dd className="font-medium text-foreground tabular-nums">
                        {value.toLocaleString()}
                      </dd>
                      <dt className="text-muted-foreground">{label}</dt>
                    </div>
                  ))}
                </motion.dl>
              </motion.div>
            )}
            {state.error && (
              <p role="alert" className="text-destructive">
                {state.error}
              </p>
            )}
            {state.phase === "complete" && (
              <motion.div
                variants={reduceMotion ? undefined : reveal}
                className="flex items-center justify-center gap-3 pt-2"
              >
                <Button asChild>
                  <Link to="/explore">View listening</Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setState(null);
                    setFiles([]);
                    jobId.current = null;
                  }}
                >
                  Import more
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
