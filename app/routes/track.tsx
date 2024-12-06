import { getTrack } from "@lib/services/db/tracks.server";
import { ellipsis, getCacheControl } from "@lib/utils";
import { ChevronLeft } from "lucide-react";
import { data, useNavigate } from "react-router";
import {
  TrackArtist,
  TrackImage,
  TrackMenu,
  TrackName,
} from "~/components/domain/track";
import type { Route } from "./+types/track";

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: `${ellipsis(data.name, 10)} by ${ellipsis(data.artist, 20)}`,
    },
  ];
}

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": getCacheControl({ browser: "day", cdn: "half-week" }),
  };
}

export async function loader({ params }: Route.LoaderArgs) {
  const track = await getTrack(params.trackId);
  if (!track) throw data(null, { status: 404 });

  return track;
}

export default function Track({ loaderData: track }: Route.ComponentProps) {
  const navigate = useNavigate();
  return (
    <TrackMenu
      query={encodeURIComponent(`${track.name} ${track.artist}`)}
      uri={track.uri}
    >
      <main className="flex flex-1 flex-col items-center gap-y-4 px-8 py-2">
        <div className="max-w-[640px]">
          <button
            type="button"
            onClick={() => {
              const canReturn = window.history.state?.idx !== undefined;

              if (canReturn) navigate(-1);
              else navigate("/");
            }}
            className="flex py-5 pr-3"
          >
            <ChevronLeft /> Back
          </button>
          <TrackImage id={track.id} src={track.image} alt={track.name} />
          <div className="mt-2 flex flex-col gap-y-0.5">
            <TrackName name={track.name} />
            <TrackArtist artist={track.artist} />
          </div>
        </div>
      </main>
    </TrackMenu>
  );
}
