import { Suspense, use } from "react";
import { data, redirect, useFetcher } from "react-router";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { getUserLiked, type UserLiked } from "~/lib/services/db/tracks.server";
import { db } from "~/lib/services/db.server";
import { syncUserLikedFull } from "~/lib/services/scheduler/scripts/sync/liked.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";
import type { Route } from "./+types/profile.liked";

export async function loader({ context, params }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);
  if (!userId) throw redirect("/");

  return { userId, liked: getUserLiked(db, { userId, provider: "spotify" }) };
}

export async function action({ request, context }: Route.ActionArgs) {
  const currentUserId = context.get(userContext);
  if (!currentUserId) {
    return data({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = formData.get("userId");

  if (intent !== "sync-liked" || userId !== currentUserId) {
    return data({ success: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    const spotify = await getSpotifyClient({ userId });
    await syncUserLikedFull({ userId, spotify });
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

export default function ProfileLiked({
  loaderData: { userId, liked },
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex h-12 items-center gap-2">
        <p className="text-muted-foreground text-sm">Liked</p>
        <LikedSyncButton userId={userId} />
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
  const rest = count - tracks.length;

  return (
    <div className="flex flex-col gap-y-2">
      {tracks.map((track) => {
        return <Track key={track.name} track={track} />;
      })}

      <p className="mx-auto font-semibold text-muted-foreground text-xs">
        {rest ? `+ ${rest.toLocaleString()}` : "NONE"}
      </p>
    </div>
  );
}

function LikedSyncButton({ userId }: { userId: string }) {
  const fetcher = useFetcher();
  const isSyncing =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="ml-auto"
      disabled={isSyncing}
      onClick={() => {
        fetcher.submit({ intent: "sync-liked", userId }, { method: "post" });
      }}
    >
      {isSyncing ? <Waver /> : "Full Sync"}
    </Button>
  );
}
