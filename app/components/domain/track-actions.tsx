import { Heart, ListMusic, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useFetcher } from "react-router";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function TrackLikeButton({
  uri,
  provider,
}: {
  uri: string;
  provider: string;
}) {
  const fetcher = useFetcher();
  const [submittedUri, setSubmittedUri] = useState<string>();
  const isLoading =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        aria-live="polite"
        disabled={isLoading}
        onClick={() => {
          setSubmittedUri(uri);
          const formData = new FormData();
          formData.set("uri", uri);
          formData.set("provider", provider);
          fetcher.submit(formData, {
            method: "post",
            action: "/actions/like",
          });
        }}
      >
        {isLoading ? (
          <>
            <Waver /> Saving
          </>
        ) : (
          <>
            <Heart />{" "}
            {submittedUri === uri &&
            fetcher.data?.type === "liked" &&
            fetcher.data?.error === null
              ? "Liked"
              : "Like"}
          </>
        )}
      </Button>
      {submittedUri === uri &&
        fetcher.state === "idle" &&
        fetcher.data?.error && (
          <p role="alert" className="max-w-56 text-xs text-destructive">
            Couldn’t save this track. Try again.
          </p>
        )}
    </div>
  );
}

export function TrackQueueButton({
  uri,
  provider,
}: {
  uri: string;
  provider: string;
}) {
  const fetcher = useFetcher();
  const [submittedUri, setSubmittedUri] = useState<string>();
  const isLoading =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        aria-live="polite"
        disabled={isLoading}
        onClick={() => {
          setSubmittedUri(uri);
          const formData = new FormData();
          formData.set("uri", uri);
          formData.set("provider", provider);
          fetcher.submit(formData, {
            method: "post",
            action: "/actions/queue",
          });
        }}
      >
        {isLoading ? (
          <>
            <Waver /> Adding
          </>
        ) : (
          <>
            <Plus />{" "}
            {submittedUri === uri &&
            fetcher.data?.type === "queue" &&
            fetcher.data?.error === null
              ? "Queued"
              : "Add to queue"}
          </>
        )}
      </Button>
      {submittedUri === uri &&
        fetcher.state === "idle" &&
        fetcher.data?.error && (
          <p role="alert" className="max-w-56 text-xs text-destructive">
            {fetcher.data.error === "not listening"
              ? "Play something in Spotify, then try again."
              : "Couldn’t queue this track. Try again."}
          </p>
        )}
    </div>
  );
}

export function TracksQueueButton({
  tracks,
  provider,
}: {
  tracks: Array<{ uri: string }>;
  provider: string;
}) {
  const fetcher = useFetcher();
  const isLoading =
    fetcher.state === "submitting" || fetcher.state === "loading";

  useEffect(() => {
    if (fetcher.data?.type !== "queue-multiple") return;
    if (fetcher.data.error === null) toast.success("Added to queue");
    else
      toast.error(
        fetcher.data.error === "not listening"
          ? "Play something in Spotify, then try again."
          : "Couldn’t finish adding tracks. Some may already be queued.",
      );
  }, [fetcher.data]);

  const queueCount = (count: number) => {
    const tracksToQueue = tracks.slice(0, count);
    const formData = new FormData();
    formData.set(
      "uris",
      JSON.stringify(tracksToQueue.map((track) => track.uri)),
    );
    formData.set("provider", provider);
    fetcher.submit(formData, {
      method: "post",
      action: "/actions/queue-multiple",
    });
  };

  const queueOptions = [
    ...new Set([5, 10, 20, 50, 100, Math.min(tracks.length, 100)]),
  ]
    .filter((count) => count > 0 && count <= tracks.length)
    .sort((a, b) => a - b);

  if (queueOptions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isLoading}
          aria-label="Queue tracks"
        >
          {isLoading ? <Waver /> : <ListMusic />} Queue
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {queueOptions.map((count) => (
          <DropdownMenuItem
            key={count}
            onClick={() => queueCount(count)}
            disabled={isLoading}
          >
            {count} tracks
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
