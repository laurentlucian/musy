import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { Suspense, use, useEffect } from "react";
import {
  data,
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
    (match: { id?: string }) => match.id === "routes/profile/profile.playlist",
  );
  const isOwnProfile = currentUserId === userId;

  return (
    <>
      {!isDetailRoute && isOwnProfile && (
        <div className="page-toolbar">
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

  if (!playlists.length)
    return (
      <div className="empty-state">
        Your playlists will appear here after syncing Spotify.
      </div>
    );

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
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
    <Link
      to={`/profile/${userId}/playlists/${playlist.id}`}
      viewTransition
      className="group min-w-0"
    >
      <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
        {playlist.image ? (
          <Image
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            src={playlist.image}
            alt=""
            name={playlist.name}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-semibold text-3xl text-muted-foreground">
            {playlist.name.charAt(0)}
          </div>
        )}
      </div>
      <p className="truncate font-medium group-hover:underline">
        {playlist.name}
      </p>
      <p className="mt-1 text-muted-foreground text-xs">
        {playlist.total.toLocaleString()}{" "}
        {playlist.total === 1 ? "track" : "tracks"}
      </p>
    </Link>
  );
}

function PlaylistsSyncButton({ userId }: { userId: string }) {
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
        fetcher.submit(
          { intent: "sync-playlists", userId },
          { method: "post" },
        );
      }}
    >
      {isSyncing ? <Waver /> : <RefreshCcw />}
      {isSyncing ? "Refreshing…" : "Refresh"}
    </Button>
  );
}
