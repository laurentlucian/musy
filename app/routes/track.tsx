import { ChevronLeft } from "lucide-react";
import { data, useNavigate } from "react-router";
import { TrackArtist, TrackImage, TrackName } from "~/components/domain/track";
import {
  TrackLikeButton,
  TrackQueueButton,
} from "~/components/domain/track-actions";
import { getTrack } from "~/lib/services/db/tracks.server";
import { db } from "~/lib/services/db.server";
import { ellipsis } from "~/lib/utils";
import type { Route } from "./+types/track";

function getArtistName(track: any): string {
  return track.artists?.[0]?.artist?.name || "Unknown";
}

function getArtistUri(track: any): string {
  return track.artists?.[0]?.artist?.uri || track.uri;
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
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={async () => {
            const canReturn = window.history.state?.idx !== undefined;

            if (canReturn) await navigate(-1);
            else await navigate("/");
          }}
          className="flex py-5 pr-3"
        >
          <ChevronLeft /> Back
        </button>
        <div className="flex items-center gap-x-2">
          <TrackLikeButton uri={track.uri} provider={track.provider} />
          <TrackQueueButton uri={track.uri} provider={track.provider} />
        </div>
      </div>
      <TrackImage id={track.id} src={track.image} alt={track.name} />
      <div className="mt-2 flex flex-col gap-y-0.5">
        <TrackName name={track.name} uri={track.uri} />
        <TrackArtist artist={getArtistName(track)} uri={getArtistUri(track)} />
      </div>
    </div>
  );
}
