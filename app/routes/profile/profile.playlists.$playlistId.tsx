import { ChevronLeft, RefreshCcw } from "lucide-react";
import { Suspense, use, useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Image } from "~/components/ui/image";
import { userContext } from "~/context";
import { getPlaylistWithTracks } from "~/lib/services/db/tracks.server";
import { db } from "~/lib/services/db.server";
import {
  likePlaylistTracks,
  unlikePlaylistTracks,
} from "~/lib/services/scheduler/scripts/playlist-actions.server";
import { syncSinglePlaylist } from "~/lib/services/scheduler/scripts/sync/playlist.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";
import type { Route } from "./+types/profile.playlists.$playlistId";

export async function loader({ context, params }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);
  const playlistId = params.playlistId;

  if (!userId || !playlistId) throw redirect("/");

  return {
    userId,
    playlistId,
    playlistData: getPlaylistWithTracks(db, { playlistId, userId }),
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
  const playlistId = formData.get("playlistId");

  if (userId !== currentUserId || !playlistId) {
    return data({ success: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    const spotify = await getSpotifyClient({ userId: userId.toString() });

    if (intent === "sync-playlist") {
      await syncSinglePlaylist({
        playlistId: playlistId.toString(),
        spotify,
        userId: userId.toString(),
      });
      return data({ success: true });
    }

    if (intent === "like-playlist") {
      const result = await likePlaylistTracks({
        userId: userId.toString(),
        playlistId: playlistId.toString(),
        spotify,
      });
      return data(result);
    }

    if (intent === "unlike-playlist") {
      const result = await unlikePlaylistTracks({
        userId: userId.toString(),
        playlistId: playlistId.toString(),
        spotify,
      });
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

export default function ProfilePlaylistDetail({
  loaderData: { userId, playlistData },
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex h-12 items-center gap-2">
        <BackButton userId={userId} />
      </div>
      <Suspense fallback={<Waver />}>
        <PlaylistDetailContent userId={userId} playlistData={playlistData} />
      </Suspense>
    </>
  );
}

function BackButton({ userId }: { userId: string }) {
  return (
    <Button asChild variant="ghost" size="sm" className="gap-2">
      <Link
        to={`/profile/${userId}/playlists`}
        className="text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        <span className="text-sm">Back</span>
      </Link>
    </Button>
  );
}

function PlaylistDetailContent({
  userId,
  playlistData,
}: {
  userId: string;
  playlistData: ReturnType<typeof getPlaylistWithTracks>;
}) {
  const data = use(playlistData);

  if (!data) {
    return (
      <div className="text-muted-foreground text-sm">Playlist not found</div>
    );
  }

  const { playlist, tracks } = data;

  const firstLetter = playlist.name.charAt(0).toUpperCase();
  const hasImage = playlist.image && playlist.image.trim() !== "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-lg bg-card p-4">
        {hasImage ? (
          <Image
            className="size-16 rounded"
            src={playlist.image}
            alt={playlist.name}
            name={playlist.name}
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded bg-muted font-bold text-2xl">
            {firstLetter}
          </div>
        )}
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="font-bold text-xl">{playlist.name}</h1>
          {playlist.description && (
            <p className="line-clamp-2 text-muted-foreground text-sm">
              {playlist.description}
            </p>
          )}
        </div>
        <PlaylistActions
          userId={userId}
          playlistId={playlist.id}
          trackCount={tracks.length}
          playlistName={playlist.name}
        />
      </div>

      <div className="flex flex-col gap-y-2">
        {tracks.map((track) => {
          return <Track key={track.id} track={track} />;
        })}
      </div>
    </div>
  );
}

function PlaylistActions({
  userId,
  playlistId,
  trackCount,
  playlistName,
}: {
  userId: string;
  playlistId: string;
  trackCount: number;
  playlistName: string;
}) {
  const fetcher = useFetcher();
  const [unlikeDialogOpen, setUnlikeDialogOpen] = useState(false);
  const isSubmitting = fetcher.state === "submitting" || fetcher.state === "loading";
  const currentIntent = fetcher.formData?.get("intent")?.toString();
  
  const isSyncing = isSubmitting && currentIntent === "sync-playlist";
  const isBulkAction = isSubmitting && (currentIntent === "like-playlist" || currentIntent === "unlike-playlist");

  const handleLike = () => {
    fetcher.submit(
      { intent: "like-playlist", userId, playlistId },
      { method: "post" },
    );
  };

  const handleUnlike = () => {
    setUnlikeDialogOpen(false);
    fetcher.submit(
      { intent: "unlike-playlist", userId, playlistId },
      { method: "post" },
    );
  };

  const handleSync = () => {
    fetcher.submit(
      { intent: "sync-playlist", userId, playlistId },
      { method: "post" },
    );
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isSyncing}
          onClick={handleSync}
        >
          {isSyncing ? <Waver /> : <RefreshCcw />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBulkAction}
            >
              {isBulkAction ? <Waver /> : "Bulk"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleLike} disabled={isBulkAction}>
              Like
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setUnlikeDialogOpen(true)}
              disabled={isBulkAction}
            >
              Unlike
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={unlikeDialogOpen} onOpenChange={setUnlikeDialogOpen}>
        <DialogContent>
          <DialogTitle>Unlike all songs?</DialogTitle>
          <DialogDescription>
            This will unlike all {trackCount.toLocaleString()} songs in "
            {playlistName}". This action cannot be undone.
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleUnlike}
              disabled={isBulkAction}
            >
              {isBulkAction ? <Waver /> : "Unlike All"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
