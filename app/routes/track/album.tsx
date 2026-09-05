import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { data, Link, useNavigate } from "react-router";
import { AlbumImage } from "~/components/domain/album";
import { PopularityIndicator } from "~/components/ui";
import { Button, buttonVariants } from "~/components/ui/button";
import { ellipsis, formatDate } from "~/components/utils";
import { db } from "~/lib.server/services/db";
import { getAlbum } from "~/lib.server/services/db/albums";
import type { Route } from "./+types/album";

type AlbumData = NonNullable<Awaited<ReturnType<typeof getAlbum>>>;

function getArtistName(album: AlbumData): string {
  return album.artist?.name || "Unknown";
}

function getArtistId(album: AlbumData): string | undefined {
  return album.artist?.id;
}

function getArtistUri(album: AlbumData): string {
  return album.artist?.uri || album.uri;
}

const ALBUM_TYPE_LABELS: Record<string, string> = {
  album: "Album",
  single: "Single",
  compilation: "Compilation",
  "appears-on": "Appears On",
  "user-collection": "User Collection",
};

const getAlbumTypeLabel = (type: string) => {
  return ALBUM_TYPE_LABELS[type] || type;
};

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
  const artistName = getArtistName(album);
  const artistId = getArtistId(album);
  const artistUri = getArtistUri(album);

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
      <Button
        type="button"
        variant="ghost"
        className="mb-8 -ml-3 gap-2 text-muted-foreground"
        onClick={async () => {
          if ((window.history.state?.idx ?? 0) > 0) await navigate(-1);
          else await navigate("/profile");
        }}
      >
        <ArrowLeft className="size-4" /> Back
      </Button>
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-12 lg:gap-10">
        <div className="w-full max-w-md">
          <AlbumImage
            id={album.id}
            src={album.image}
            alt={album.name}
            width={500}
            height={500}
            className="aspect-square h-auto w-full rounded-none object-cover shadow-[0_12px_32px_-16px_rgba(37,40,32,0.35)]"
          />
        </div>
        <div className="min-w-0">
          <p className="mb-4 text-xs font-medium uppercase text-primary">
            Album
          </p>
          <h1 className="font-semibold text-2xl leading-[1.05] tracking-tight sm:text-2xl lg:text-3xl">
            {album.name}
          </h1>
          <div className="mt-5 text-lg text-muted-foreground">
            {artistId ? (
              <Link
                to={`/artist/${artistId}`}
                className="hover:text-primary"
                viewTransition
              >
                {artistName} →
              </Link>
            ) : (
              <a
                href={artistUri}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                {artistName} ↗
              </a>
            )}
          </div>
          <div className="my-7 flex flex-wrap gap-2">
            <a
              href={album.uri}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "lg", className: "gap-2" })}
            >
              Open in Spotify <ArrowUpRight className="size-4" />
            </a>
          </div>
          <div className="space-y-6">
            <dl className="divide-y divide-border border-y border-border text-sm">
              <div className="flex justify-between gap-6 py-4">
                <dt className="text-muted-foreground">Format</dt>
                <dd>{getAlbumTypeLabel(album.type)}</dd>
              </div>
              <div className="flex justify-between gap-6 py-4">
                <dt className="text-muted-foreground">Tracks</dt>
                <dd>{album.total}</dd>
              </div>
              {album.date && (
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-muted-foreground">Released</dt>
                  <dd>{formatDate(album.date)}</dd>
                </div>
              )}
            </dl>
            <PopularityIndicator value={album.popularity} showLabel />
          </div>
        </div>
      </div>
    </section>
  );
}
