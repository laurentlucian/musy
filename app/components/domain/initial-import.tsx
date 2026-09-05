import { Check, LoaderCircle, X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFetcher, useParams, useRevalidator } from "react-router";
import { Button } from "~/components/ui/button";
import type { getInitialImport } from "~/lib.server/services/scheduler/initial-import";

type ImportState = Awaited<ReturnType<typeof getInitialImport>>;
const ImportContext = createContext<ImportState>(null);

export function useInitialImport() {
  const current = useContext(ImportContext);
  const { userId } = useParams();
  return userId && userId !== current?.userId ? null : current;
}

export function InitialImportBanner({
  initialImport,
  children,
}: {
  initialImport: ImportState;
  children: ReactNode;
}) {
  const fetcher = useFetcher<{ import: ImportState; error: string | null }>();
  const revalidator = useRevalidator();
  const current = fetcher.data?.import ?? initialImport;
  const active = current?.status === "queued" || current?.status === "running";
  const observedImport = useRef(
    Boolean(current && current.status !== "complete"),
  );
  const previousProgress = useRef(
    `${current?.stage}:${current?.status}:${current?.imported}`,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && fetcher.state === "idle") {
        void fetcher.load("/resources/import");
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [active, fetcher.state, fetcher.load]);

  useEffect(() => {
    if (active) observedImport.current = true;
    const progress = `${current?.stage}:${current?.status}:${current?.imported}`;
    if (progress !== previousProgress.current) {
      previousProgress.current = progress;
      void revalidator.revalidate();
    }
  }, [active, current?.stage, current?.status, current?.imported, revalidator]);

  const complete = current?.status === "complete";
  const visible =
    current && !dismissed && (!complete || observedImport.current);
  const stageLabels: Record<string, string> = {
    recent: "Recent listening",
    top: "Top music",
    liked: "Liked songs",
    stats: "Listening stats",
  };

  return (
    <ImportContext value={current}>
      {visible && (
        <section
          aria-label="Spotify import"
          className="mb-6 rounded-md border border-border p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <output className="flex items-center gap-2 font-medium text-sm">
                {complete ? (
                  <Check aria-hidden="true" className="size-4 shrink-0" />
                ) : active ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 shrink-0 motion-safe:animate-spin"
                  />
                ) : null}
                {complete
                  ? "Your music is ready"
                  : current.status === "failed"
                    ? "Import paused"
                    : "Importing your music…"}
              </output>
              {!complete && (
                <p className="mt-2 text-muted-foreground text-xs">
                  {current.status === "failed"
                    ? "Your progress is saved. Retry to continue."
                    : `${current.retryAt > Date.now() ? "Waiting for Spotify. Retrying automatically" : (stageLabels[current.stage] ?? "Getting started")}${current.stage === "liked" && current.total !== null ? ` · ${current.imported.toLocaleString()} of ${current.total.toLocaleString()}` : ""}. You can keep browsing or close this page.`}
                </p>
              )}
              <p className="mt-2 text-muted-foreground text-xs">
                Saved music and recent plays. Spotify doesn’t provide your full
                listening history.
              </p>
              {fetcher.data?.error && (
                <p role="alert" className="mt-2 text-destructive text-xs">
                  {fetcher.data.error}
                </p>
              )}
            </div>
            {complete ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Dismiss import status"
                onClick={() => setDismissed(true)}
              >
                <X />
              </Button>
            ) : current.status === "failed" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={fetcher.state !== "idle"}
                onClick={() => {
                  void fetcher.submit(
                    {},
                    { method: "post", action: "/resources/import" },
                  );
                }}
              >
                {fetcher.state === "idle" ? "Retry" : "Retrying…"}
              </Button>
            ) : null}
          </div>
          {active &&
            current.stage === "liked" &&
            current.total !== null &&
            current.total > 0 && (
              <progress
                aria-label="Liked songs imported"
                value={current.imported}
                max={current.total}
                className="mt-3 h-1 w-full accent-primary"
              />
            )}
        </section>
      )}
      {children}
    </ImportContext>
  );
}

export function ImportEmptyState({ children }: { children: ReactNode }) {
  const current = useInitialImport();
  return (
    <div className="empty-state">
      {current && current.status !== "complete"
        ? current.status === "failed"
          ? "Import paused. Retry above to load your music."
          : "Your music will appear as it imports."
        : children}
    </div>
  );
}
