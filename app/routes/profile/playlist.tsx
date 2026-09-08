import { resolveProfileId } from "~/lib.server/services/usernames";
import { toast } from "sonner";
import { TracksQueueButton } from "~/components/domain/track-actions";
import { format } from "date-fns";
import { ChevronLeft, RefreshCcw, Heart, MoreHorizontal } from "lucide-react";
import { Suspense, use, useState, useEffect } from "react";
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
import { decodeHtmlEntity } from "~/components/utils";
import { userContext } from "~/context";
import { db } from "~/lib.server/services/db";
import { getPlaylistWithTracks } from "~/lib.server/services/db/tracks";
import {
  likePlaylistTracks,
  unlikePlaylistTracks,
} from "~/lib.server/services/scheduler/scripts/playlist-actions";
import { syncSinglePlaylist } from "~/lib.server/services/scheduler/scripts/sync/playlist";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import type { Route } from "./+types/playlist";

export async function loader({ context, params }: Route.LoaderArgs) {
  const userId = await resolveProfileId(
    params.userId,
    context.get(userContext),
  );
  const currentUserId = context.get(userContext);
  const playlistId = params.playlistId;

  if (!userId || !playlistId) throw redirect("/");

  return {
    userId,
    currentUserId,
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
  loaderData: { userId, currentUserId, playlistData },
}: Route.ComponentProps) {
  return (
    <Suspense fallback={<Waver />}>
      <PlaylistDetailContent
        userId={userId}
        currentUserId={currentUserId}
        playlistData={playlistData}
      />
    </Suspense>
  );
}

function BackButton({ userId }: { userId: string }) {
  return (
    <Button asChild variant="ghost" size="sm">
      <Link
        to={`/profile/${userId}/playlists`}
        className="text-muted-foreground"
      >
        <ChevronLeft /> Playlists
      </Link>
    </Button>
  );
}

function PlaylistDetailContent({
  userId,
  currentUserId,
  playlistData,
}: {
  userId: string;
  currentUserId: string | null;
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
    <div className="flex flex-col gap-6">
      <div className="page-toolbar">
        <BackButton userId={userId} />
        {currentUserId === userId && (
          <PlaylistActions
            userId={userId}
            playlistId={playlist.id}
            tracks={tracks}
            trackCount={tracks.length}
            playlistName={playlist.name}
          />
        )}
      </div>
      <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
        {hasImage ? (
          <Image
            className="size-40 rounded-lg object-cover sm:size-48"
            src={playlist.image}
            alt={playlist.name}
            name={playlist.name}
          />
        ) : (
          <div className="flex size-40 items-center justify-center rounded-lg bg-muted font-semibold text-3xl sm:size-48">
            {firstLetter}
          </div>
        )}
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-tight sm:text-2xl">
            {playlist.name}
          </h1>
          <p className="section-label mt-3">
            {tracks.length.toLocaleString()} tracks
          </p>
          {playlist.description && (
            <p className="mt-3 max-w-lg text-muted-foreground text-sm leading-relaxed">
              {decodeHtmlEntity(playlist.description)}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        {!tracks.length && (
          <div className="empty-state">No tracks in this playlist yet.</div>
        )}
        {tracks.map((track) => {
          const extraInfo = track.addedAt
            ? format(new Date(track.addedAt), "MMM d, y")
            : undefined;
          return <Track key={track.id} track={track} extraInfo={extraInfo} />;
        })}
      </div>
    </div>
  );
}

function PlaylistActions({
  userId,
  playlistId,
  tracks,
  trackCount,
  playlistName,
}: {
  userId: string;
  playlistId: string;
  tracks: Array<{ id: string; uri: string; name: string }>;
  trackCount: number;
  playlistName: string;
}) {
  const fetcher = useFetcher<{ success?: boolean; error?: string }>();
  const [unlikeDialogOpen, setUnlikeDialogOpen] = useState(false);
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if (fetcher.data.error) toast.error(fetcher.data.error);
    else if (fetcher.data.success) toast.success("Playlist updated");
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <TracksQueueButton tracks={tracks} provider="spotify" />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isSubmitting || !trackCount}
          onClick={() => {
            void fetcher.submit(
              { intent: "like-playlist", userId, playlistId },
              { method: "post" },
            );
          }}
        >
          <Heart /> Save all
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isSubmitting}
              aria-label="Playlist options"
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                void fetcher.submit(
                  { intent: "sync-playlist", userId, playlistId },
                  { method: "post" },
                );
              }}
            >
              <RefreshCcw /> Refresh playlist
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              disabled={!trackCount}
              onClick={() => setUnlikeDialogOpen(true)}
            >
              Remove all from liked songs
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {isSubmitting && (
          <output className="text-xs text-muted-foreground">Updating…</output>
        )}
      </div>
      <Dialog open={unlikeDialogOpen} onOpenChange={setUnlikeDialogOpen}>
        <DialogContent>
          <DialogTitle>Remove liked songs?</DialogTitle>
          <DialogDescription>
            Remove all {trackCount.toLocaleString()} tracks in “{playlistName}”
            from your Spotify liked songs. The playlist stays intact.
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={() => {
                setUnlikeDialogOpen(false);
                void fetcher.submit(
                  { intent: "unlike-playlist", userId, playlistId },
                  { method: "post" },
                );
              }}
            >
              Remove likes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
