import { ArrowLeft, Disc, Disc3 } from "lucide-react";
import { data, Link, useNavigate } from "react-router";
import { AlbumImage, AlbumName } from "~/components/domain/album";
import { PopularityIndicator } from "~/components/ui";
import { Button, buttonVariants } from "~/components/ui/button";
import { ellipsis, formatDate } from "~/components/utils";
import { db } from "~/lib.server/services/db";
import { getAlbum } from "~/lib.server/services/db/albums";
import type { Route } from "./+types/album";

function getArtistName(album: any): string {
  return album.artist?.name || "Unknown";
}

function getArtistId(album: any): string | undefined {
  return album.artist?.id;
}

function getArtistUri(album: any): string {
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
    <main className="relative min-h-dvh w-full overflow-hidden bg-background">
      {/* Header */}
      <header className="relative z-10 px-6 py-5 sm:px-8 sm:py-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              const canReturn = window.history.state?.idx !== undefined;
              if (canReturn) await navigate(-1);
              else await navigate("/");
            }}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <Disc3 className="h-4 w-4 text-foreground" />
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              Album
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-16 sm:px-8 lg:pb-20">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-10 lg:gap-16 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* Left: Image and basic info */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[500px]">
              <AlbumImage
                id={album.id}
                src={album.image}
                alt={album.name}
                width={500}
                height={500}
                className="relative rounded-3xl"
              />
            </div>

            <div className="mt-12 flex w-full max-w-lg flex-col items-center gap-y-5 text-center">
              <AlbumName
                name={album.name}
                uri={album.uri}
                className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight"
              />

              {artistId ? (
                <Link
                  to={`/artist/${artistId}`}
                  viewTransition
                  className="inline-flex items-center text-[clamp(1.1rem,2.5vw,1.5rem)] text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  {artistName}
                  <span className="ml-2 inline-block">→</span>
                </Link>
              ) : (
                <a
                  href={artistUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[clamp(1.1rem,2.5vw,1.5rem)] text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {artistName}
                  <span className="ml-2 inline-block">↗</span>
                </a>
              )}
            </div>
          </div>

          {/* Right: Details card */}
          <div className="xl:pl-8">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="relative z-10 flex flex-col gap-8">
                {/* Header badges */}
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex rounded-full border border-border bg-muted px-4 py-2 text-xs font-medium text-foreground">
                    {getAlbumTypeLabel(album.type)}
                  </span>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2">
                    <Disc className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-medium">
                      {album.total} tracks
                    </span>
                  </div>
                  <div className="flex-1" />
                </div>

                <div className="h-px bg-border" />

                {/* Popularity */}
                {album.popularity > 0 && (
                  <>
                    <div className="rounded-2xl border border-border bg-muted p-5">
                      <PopularityIndicator value={album.popularity} showLabel />
                    </div>
                    <div className="h-px bg-border" />
                  </>
                )}

                {/* Release info */}
                {album.date && (
                  <>
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-muted p-5">
                      <span className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-semibold">
                        Release Date
                      </span>
                      <span className="font-mono text-foreground text-sm">
                        {formatDate(album.date)}
                      </span>
                    </div>
                    <div className="h-px bg-border" />
                  </>
                )}

                {/* External link */}
                <a
                  href={album.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "gap-3",
                  })}
                >
                  <img
                    src="/spotify/icon-white.png"
                    alt="Spotify"
                    className="h-6 w-6"
                  />
                  <span className="relative">Open in Spotify</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
