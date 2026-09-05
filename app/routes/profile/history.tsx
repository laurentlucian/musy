import { format } from "date-fns";
import { RefreshCcw } from "lucide-react";
import { Suspense, use, useEffect } from "react";
import { data, redirect, useFetcher } from "react-router";
import { toast } from "sonner";
import { ImportEmptyState } from "~/components/domain/initial-import";
import { Track } from "~/components/domain/track";
import { TracksQueueButton } from "~/components/domain/track-actions";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { db } from "~/lib.server/services/db";
import {
  getUserRecent,
  type UserRecent,
} from "~/lib.server/services/db/tracks";
import { syncUserRecent } from "~/lib.server/services/scheduler/scripts/sync/recent";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import type { Route } from "./+types/history";

export async function loader({ context, params }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);
  const currentUserId = context.get(userContext);
  if (!userId) throw redirect("/");

  return {
    userId,
    currentUserId,
    recent: getUserRecent(db, { userId, provider: "spotify" }),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const currentUserId = context.get(userContext);
  if (!currentUserId) {
    return data({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = formData.get("userId");

  if (intent !== "sync-listened" || userId !== currentUserId) {
    return data({ success: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    const spotify = await getSpotifyClient({ userId });
    await syncUserRecent({ userId, spotify });
    return data({ success: true });
  } catch (error) {
    return data(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}

export default function ProfileListened({
  loaderData: { recent, userId, currentUserId },
}: Route.ComponentProps) {
  return (
    <>
      {currentUserId === userId && (
        <div className="page-toolbar">
          <ListenedSyncButton userId={userId} />
          <Suspense
            fallback={
              <Button size="sm" variant="outline" disabled>
                <Waver />
              </Button>
            }
          >
            <ListenedQueueButton recent={recent} />
          </Suspense>
        </div>
      )}
      {recent && (
        <Suspense fallback={<Waver />}>
          <ListenedList tracks={recent} />
        </Suspense>
      )}
    </>
  );
}

function ListenedSyncButton({ userId }: { userId: string }) {
  const fetcher = useFetcher<{ success?: boolean; error?: string }>();
  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if (fetcher.data.error) toast.error(fetcher.data.error);
    else if (fetcher.data.success) toast.success("Updated");
  }, [fetcher.state, fetcher.data]);
  const isSyncing =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isSyncing}
      onClick={() => {
        fetcher.submit({ intent: "sync-listened", userId }, { method: "post" });
      }}
    >
      {isSyncing ? <Waver /> : <RefreshCcw />}
      {isSyncing ? "Refreshing…" : "Refresh"}
    </Button>
  );
}

function ListenedQueueButton({ recent }: { recent: UserRecent }) {
  const { tracks } = use(recent);

  return <TracksQueueButton tracks={tracks} provider="spotify" />;
}

function ListenedList(props: { tracks: UserRecent }) {
  const { tracks, count } = use(props.tracks);

  if (!tracks.length)
    return (
      <ImportEmptyState>
        No listens yet. Your next tracks will appear here.
      </ImportEmptyState>
    );

  return (
    <div className="flex flex-col">
      {tracks.map((track) => {
        const extraInfo = track.playedAt ? (
          <>
            {format(new Date(track.playedAt), "MMM d, y")}
            <span className="text-muted-foreground/70">
              {" · "}
              {format(new Date(track.playedAt), "h:mm a")}
            </span>
          </>
        ) : undefined;
        return (
          <Track
            key={`${track.id}-${track.playedAt ?? ""}`}
            track={track}
            extraInfo={extraInfo}
          />
        );
      })}

      <p className="py-6 text-center text-muted-foreground text-xs">
        {tracks.length < count
          ? `${tracks.length.toLocaleString()} of ${count.toLocaleString()} ${count === 1 ? "track" : "tracks"}`
          : `${count.toLocaleString()} ${count === 1 ? "track" : "tracks"}`}
      </p>
    </div>
  );
}
