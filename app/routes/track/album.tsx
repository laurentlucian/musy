import { ChevronLeft } from "lucide-react";
import { data, useNavigate } from "react-router";
import { AlbumArtist, AlbumImage, AlbumName } from "~/components/domain/album";
import { getAlbum } from "~/lib/services/db/albums.server";
import { db } from "~/lib/services/db.server";
import { ellipsis } from "~/lib/utils";
import type { Route } from "./+types/album";

function getArtistName(album: any): string {
  return album.artist?.name || "Unknown";
}

function getArtistUri(album: any): string {
  return album.artist?.uri || album.uri;
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
  const album = await getAlbum(db, params.albumId);
  if (!album) throw data(null, { status: 404 });

  return album;
}

export default function Album({ loaderData: album }: Route.ComponentProps) {
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
      <AlbumImage id={album.id} src={album.image} alt={album.name} />
      <div className="mt-2 flex flex-col gap-y-0.5">
        <AlbumName name={album.name} uri={album.uri} />
        <AlbumArtist artist={getArtistName(album)} uri={getArtistUri(album)} />
      </div>
    </div>
  );
}
