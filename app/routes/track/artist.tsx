import { ChevronLeft } from "lucide-react";
import { data, useNavigate } from "react-router";
import { ArtistImage, ArtistName } from "~/components/domain/artist";
import { ellipsis } from "~/components/utils";
import { db } from "~/lib.server/services/db";
import { getArtist } from "~/lib.server/services/db/artists";
import type { Route } from "./+types/artist";

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    {
      title: ellipsis(loaderData.name, 30),
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const artist = await getArtist(db, params.artistId);
  if (!artist) throw data(null, { status: 404 });

  return artist;
}

export default function Artist({ loaderData: artist }: Route.ComponentProps) {
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
      </div>
      <ArtistImage id={artist.id} src={artist.image} alt={artist.name} />
      <div className="mt-2 flex flex-col gap-y-0.5">
        <ArtistName name={artist.name} uri={artist.uri} />
      </div>
    </div>
  );
}
