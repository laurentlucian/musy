import { RefreshCcw } from "lucide-react";
import { Suspense, use } from "react";
import {
  data,
  href,
  Link,
  Outlet,
  redirect,
  useFetcher,
  useMatches,
} from "react-router";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { Image } from "~/components/ui/image";
import { userContext } from "~/context";
import { db } from "~/lib.server/services/db";
import {
  getUserPlaylists,
  type UserPlaylists,
} from "~/lib.server/services/db/tracks";
import { syncUserPlaylists } from "~/lib.server/services/scheduler/scripts/sync/playlist";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import type { Route } from "./+types/profile.playlists";

export async function loader({ context, params }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);
  const currentUserId = context.get(userContext);
  if (!userId) throw redirect("/");

  return {
    userId,
    currentUserId,
    playlists: getUserPlaylists(db, { userId, provider: "spotify" }),
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

  if (intent !== "sync-playlists" || userId !== currentUserId) {
    return data({ success: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    const spotify = await getSpotifyClient({ userId });
    await syncUserPlaylists({ userId, spotify });
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

export default function ProfilePlaylists({
  loaderData: { userId, currentUserId, playlists },
}: Route.ComponentProps) {
  const matches = useMatches();
  const isDetailRoute = matches.some(
    (match: { id?: string }) =>
      match.id === "routes/profile/profile.playlists.$playlistId",
  );
  const isOwnProfile = currentUserId === userId;

  return (
    <>
      {!isDetailRoute && isOwnProfile && (
        <div className="flex h-12 items-center gap-2">
          <PlaylistsSyncButton userId={userId} />
        </div>
      )}
      {!isDetailRoute && playlists && (
        <Suspense fallback={<Waver />}>
          <PlaylistsList playlists={playlists} userId={userId} />
        </Suspense>
      )}
      <Outlet />
    </>
  );
}

function PlaylistsList(props: { playlists: UserPlaylists; userId: string }) {
  const { playlists } = use(props.playlists);

  return (
    <div className="flex flex-col gap-y-2">
      {playlists.map((playlist) => {
        return (
          <PlaylistItem
            key={playlist.id}
            playlist={playlist}
            userId={props.userId}
          />
        );
      })}
    </div>
  );
}

function PlaylistItem({
  playlist,
  userId,
}: {
  playlist: {
    id: string;
    name: string;
    image: string;
    total: number;
    description: string | null;
  };
  userId: string;
}) {
  return (
    <Link to={`/profile/${userId}/playlists/${playlist.id}`} viewTransition>
      <div className="flex items-center gap-3 rounded-lg bg-card p-3 transition-colors duration-150 hover:bg-accent">
        {playlist.image && (
          <Image
            className="size-12 rounded"
            src={playlist.image}
            alt={playlist.name}
            name={playlist.name}
          />
        )}
        <div className="flex flex-1 flex-col gap-1">
          <p className="font-semibold text-sm">{playlist.name}</p>
          <p className="text-muted-foreground text-xs">
            {playlist.total} {playlist.total === 1 ? "track" : "tracks"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function PlaylistsSyncButton({ userId }: { userId: string }) {
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
        fetcher.submit(
          { intent: "sync-playlists", userId },
          { method: "post" },
        );
      }}
    >
      {isSyncing ? <Waver /> : <RefreshCcw />}
    </Button>
  );
}
