import { ListMusic } from "lucide-react";
import { useFetcher } from "react-router";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Track as TrackType } from "~/lib.server/services/db";

export function TrackLikeButton({
  uri,
  provider,
}: {
  uri: string;
  provider: string;
}) {
  const fetcher = useFetcher();
  const isLoading =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <Button
      type="button"
      disabled={isLoading}
      onClick={() => {
        const formData = new FormData();
        formData.set("uri", uri);
        formData.set("provider", provider);
        fetcher.submit(formData, {
          method: "post",
          action: "/actions/like",
        });
      }}
    >
      {isLoading ? <Waver /> : "Like"}
    </Button>
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
  const isLoading =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <Button
      type="button"
      disabled={isLoading}
      onClick={() => {
        const formData = new FormData();
        formData.set("uri", uri);
        formData.set("provider", provider);
        fetcher.submit(formData, {
          method: "post",
          action: "/actions/queue",
        });
      }}
    >
      {isLoading ? <Waver /> : "Queue"}
    </Button>
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

  const queueOptions = [5, 10, 20, 50, 100].filter(
    (count) => count <= tracks.length,
  );

  if (queueOptions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="sm" variant="outline" disabled={isLoading}>
          {isLoading ? <Waver /> : <ListMusic />}
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
