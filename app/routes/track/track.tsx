import { ChevronLeft, XIcon } from "lucide-react";
import { data, useNavigate } from "react-router";
import {
  TrackAlbum,
  TrackArtist,
  TrackImage,
  TrackName,
} from "~/components/domain/track";
import {
  TrackLikeButton,
  TrackQueueButton,
} from "~/components/domain/track-actions";
import { Button } from "~/components/ui/button";
import { ellipsis } from "~/components/utils";
import { db } from "~/lib.server/services/db";
import { getTrack } from "~/lib.server/services/db/tracks";
import type { Route } from "./+types/track";

function getArtistName(track: any): string {
  return track.artists?.[0]?.artist?.name || "Unknown";
}

function getArtistId(track: any): string | undefined {
  return track.artists?.[0]?.artist?.id;
}

function getArtistUri(track: any): string {
  return track.artists?.[0]?.artist?.uri || track.uri;
}

function getAlbumName(track: any): string {
  return track.album?.name || "Unknown Album";
}

function getAlbumId(track: any): string | undefined {
  return track.album?.id;
}

function getAlbumUri(track: any): string {
  return track.album?.uri || track.uri;
}

export function meta({ loaderData }: Route.MetaArgs) {
  const artistName = getArtistName(loaderData);
  return [
    {
      title: `${ellipsis(loaderData.name, 10)} by ${ellipsis(artistName, 20)}`,
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const track = await getTrack(db, params.trackId);
  if (!track) throw data(null, { status: 404 });

  return track;
}

export default function Track({ loaderData: track }: Route.ComponentProps) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-[640px]">
      <div className="flex items-center justify-between py-4">
        <Button
          type="button"
          variant="ghost"
          onClick={async () => {
            const canReturn = window.history.state?.idx !== undefined;

            if (canReturn) await navigate(-1);
            else await navigate("/");
          }}
        >
          <XIcon />
        </Button>
        <div className="flex items-center gap-x-2">
          <TrackLikeButton uri={track.uri} provider={track.provider} />
          <TrackQueueButton uri={track.uri} provider={track.provider} />
        </div>
      </div>
      <TrackImage id={track.id} src={track.image} alt={track.name} />
      <div className="mt-2 flex flex-col gap-y-0.5">
        <TrackName name={track.name} uri={track.uri} />
        <TrackArtist
          artist={getArtistName(track)}
          artistId={getArtistId(track)}
          uri={getArtistUri(track)}
        />
        {track.album && (
          <TrackAlbum
            album={getAlbumName(track)}
            albumId={getAlbumId(track)}
            uri={getAlbumUri(track)}
          />
        )}
      </div>
    </div>
  );
}
