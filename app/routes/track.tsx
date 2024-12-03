import { ChevronLeft } from "lucide-react";
import { Link, data, useNavigate } from "react-router";
import { TrackMenu } from "~/components/menu/track";
import { Image } from "~/components/ui/image";
import { ellipsis, getCacheControl } from "~/lib/utils";
import { getTrack } from "~/services/prisma/tracks.server";
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
          <Image
            src={track.image}
            alt={track.name}
            style={{
              viewTransitionName: `track-image-${track.id}`,
            }}
          />
          <div className="mt-2 flex flex-col gap-y-0.5">
            <p className="line-clamp-2 text-ellipsis font-medium text-lg">
              {track.name} I Smoked Away My Brain (I'm God x Demons Mashup)
              (feat. Imogen Heap & Clams Casino)
            </p>
            <p className="text-muted-foreground text-sm">{track.artist}</p>
          </div>
        </div>
      </main>
    </TrackMenu>
  );
}
