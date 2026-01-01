import { format } from "date-fns";
import { RefreshCcw } from "lucide-react";
import { Suspense, use } from "react";
import { data, redirect, useFetcher } from "react-router";
import { Track } from "~/components/domain/track";
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
import type { Route } from "./+types/profile.listened";

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
        <div className="flex h-12 items-center gap-2">
          <ListenedSyncButton userId={userId} />
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
  const fetcher = useFetcher();
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
    </Button>
  );
}

function ListenedList(props: { tracks: UserRecent }) {
  const { tracks, count } = use(props.tracks);
  const rest = count - tracks.length;

  return (
    <div className="flex flex-col gap-y-2">
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
        return <Track key={track.name} track={track} extraInfo={extraInfo} />;
      })}

      <p className="mx-auto font-semibold text-muted-foreground text-xs">
        {rest ? `+ ${rest}` : "NONE"}
      </p>
    </div>
  );
}
