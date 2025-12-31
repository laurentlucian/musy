import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { Suspense, use } from "react";
import { Link, redirect } from "react-router";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { Image } from "~/components/ui/image";
import { userContext } from "~/context";
import { getPlaylistWithTracks } from "~/lib/services/db/tracks.server";
import { db } from "~/lib/services/db.server";
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

export default function ProfilePlaylistDetail({
  loaderData: { userId, playlistData },
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex h-12 items-center gap-2">
        <BackButton userId={userId} />
      </div>
      <Suspense fallback={<Waver />}>
        <PlaylistDetailContent playlistData={playlistData} />
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
  playlistData,
}: {
  playlistData: ReturnType<typeof getPlaylistWithTracks>;
}) {
  const data = use(playlistData);

  if (!data) {
    return (
      <div className="text-muted-foreground text-sm">Playlist not found</div>
    );
  }

  const { playlist, tracks, createdAt } = data;

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
      </div>

      <div className="flex flex-col gap-y-2">
        {tracks.map((track) => {
          return <Track key={track.id} track={track} />;
        })}
      </div>
    </div>
  );
}
