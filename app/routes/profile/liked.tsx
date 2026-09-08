import { resolveProfileId } from "~/lib.server/services/usernames";
import { format } from "date-fns";
import { Plus, RefreshCcw } from "lucide-react";
import { Suspense, use, useEffect } from "react";
import { data, Link, redirect, useFetcher } from "react-router";
import { toast } from "sonner";
import { ImportEmptyState } from "~/components/domain/initial-import";
import { Track } from "~/components/domain/track";
import { TracksQueueButton } from "~/components/domain/track-actions";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { db } from "~/lib.server/services/db";
import { getUserLiked, type UserLiked } from "~/lib.server/services/db/tracks";
import { createPlaylistsByYear } from "~/lib.server/services/scheduler/scripts/create-playlists";
import { syncUserLikedFull } from "~/lib.server/services/scheduler/scripts/sync/liked";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import { Selector } from "~/routes/profile/utils/profile.utils";
import type { Route } from "./+types/liked";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const userId = await resolveProfileId(
    params.userId,
    context.get(userContext),
  );
  const currentUserId = context.get(userContext);
  if (!userId) throw redirect("/");

  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const year = yearParam && yearParam !== "all" ? +yearParam : undefined;

  return {
    userId,
    currentUserId,
    year: year ?? null,
    liked: getUserLiked(db, { userId, provider: "spotify", year }),
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

  if (userId !== currentUserId) {
    return data({ success: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    const spotify = await getSpotifyClient({ userId });

    if (intent === "sync-liked") {
      await syncUserLikedFull({ userId, spotify });
      return data({ success: true });
    }

    if (intent === "create-playlists-by-year") {
      const result = await createPlaylistsByYear({ userId, spotify });
      return data(result);
    }

    return data({ success: false, error: "Invalid intent" }, { status: 400 });
  } catch (error) {
    return data(
      {
        success: false,
        error: error instanceof Error ? error.message : "Operation failed",
      },
      { status: 500 },
    );
  }
}

export default function ProfileLiked({
  loaderData: { userId, currentUserId, year, liked },
}: Route.ComponentProps) {
  const isOwnProfile = currentUserId === userId;

  return (
    <>
      <div className="page-toolbar gap-3">
        <Selector year={year} className="min-w-28" />
        {isOwnProfile && (
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <CreatePlaylistsButton userId={userId} />
            <LikedSyncButton userId={userId} />
            <Suspense
              fallback={
                <Button size="sm" variant="outline" disabled>
                  <Waver />
                </Button>
              }
            >
              <LikedQueueButton liked={liked} />
            </Suspense>
          </div>
        )}
      </div>
      {liked && (
        <Suspense fallback={<Waver />}>
          <LikedList tracks={liked} />
        </Suspense>
      )}
    </>
  );
}

function LikedList(props: { tracks: UserLiked }) {
  const { tracks, count } = use(props.tracks);

  if (!tracks.length)
    return (
      <ImportEmptyState>No saved tracks for this period.</ImportEmptyState>
    );

  return (
    <div className="flex flex-col">
      {tracks.map((track) => {
        const extraInfo = track.likedAt
          ? format(new Date(track.likedAt), "MMM d, y")
          : undefined;
        return <Track key={track.id} track={track} extraInfo={extraInfo} />;
      })}

      <p className="py-6 text-center text-muted-foreground text-xs">
        {tracks.length < count
          ? `${tracks.length.toLocaleString()} of ${count.toLocaleString()} ${count === 1 ? "track" : "tracks"}`
          : `${count.toLocaleString()} ${count === 1 ? "track" : "tracks"}`}
      </p>
    </div>
  );
}

function CreatePlaylistsButton({ userId }: { userId: string }) {
  return (
    <Button asChild size="sm" variant="secondary">
      <Link to={`/profile/${userId}/playlists?tool=yearly`}>
        <Plus /> Yearly playlists
      </Link>
    </Button>
  );
}

function LikedSyncButton({ userId }: { userId: string }) {
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
      variant="ghost"
      className="text-muted-foreground transition-colors duration-150"
      disabled={isSyncing}
      onClick={() => {
        void fetcher.submit(
          { intent: "sync-liked", userId },
          { method: "post" },
        );
      }}
    >
      {isSyncing ? <Waver /> : <RefreshCcw />}
      {isSyncing ? "Refreshing…" : "Refresh"}
    </Button>
  );
}

function LikedQueueButton({ liked }: { liked: UserLiked }) {
  const { tracks } = use(liked);

  return <TracksQueueButton tracks={tracks} provider="spotify" />;
}
