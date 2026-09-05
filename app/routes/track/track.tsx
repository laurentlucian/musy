import { ArrowLeft, Music2 } from "lucide-react";
import { data, Link, useNavigate } from "react-router";
import { TrackImage, TrackName } from "~/components/domain/track";
import {
  TrackLikeButton,
  TrackQueueButton,
} from "~/components/domain/track-actions";
import { GenreTag, PopularityIndicator } from "~/components/ui";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  ellipsis,
  formatDate,
  formatDuration,
  parseGenres,
} from "~/components/utils";
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

function getArtist(track: any): any {
  return track.artists?.[0]?.artist || null;
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

function getAlbum(track: any): any {
  return track.album || null;
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
  const artist = getArtist(track);
  const album = getAlbum(track);
  const genres = artist?.genres ? parseGenres(artist.genres) : [];

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
          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
              <Music2 className="h-4 w-4 text-foreground" />
              <span className="text-muted-foreground text-xs uppercase tracking-wider">
                Track
              </span>
            </div>
            <div className="h-8 w-px bg-border/50" />
            <div className="flex items-center gap-x-2">
              <TrackLikeButton uri={track.uri} provider={track.provider} />
              <TrackQueueButton uri={track.uri} provider={track.provider} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-16 sm:px-8 lg:pb-20">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-10 lg:gap-16 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* Left: Image and basic info */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[500px]">
              <TrackImage
                id={track.id}
                src={track.image}
                alt={track.name}
                width={500}
                height={500}
                className="relative rounded-3xl"
              />
            </div>

            <div className="mt-12 flex w-full max-w-lg flex-col items-center gap-y-5 text-center">
              <TrackName
                name={track.name}
                uri={track.uri}
                className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight"
              />

              {getArtistId(track) ? (
                <Link
                  to={`/artist/${getArtistId(track)}`}
                  viewTransition
                  className="inline-flex items-center text-[clamp(1.1rem,2.5vw,1.5rem)] text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  {getArtistName(track)}
                  <span className="ml-2 inline-block">→</span>
                </Link>
              ) : (
                <a
                  href={getArtistUri(track)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[clamp(1.1rem,2.5vw,1.5rem)] text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {getArtistName(track)}
                  <span className="ml-2 inline-block">↗</span>
                </a>
              )}

              {album && (
                <div className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="h-px w-8 bg-border" />
                  {getAlbumId(album) ? (
                    <Link
                      to={`/album/${getAlbumId(album)}`}
                      viewTransition
                      className="text-base transition-colors hover:text-foreground hover:underline"
                    >
                      {getAlbumName(album)}
                    </Link>
                  ) : (
                    <a
                      href={getAlbumUri(album)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base transition-colors hover:text-foreground hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getAlbumName(album)}
                    </a>
                  )}
                  <span className="h-px w-8 bg-border" />
                </div>
              )}
            </div>
          </div>

          {/* Right: Details card */}
          <div className="xl:pl-8">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="relative z-10 flex flex-col gap-8">
                {/* Header badges */}
                <div className="flex flex-wrap items-center gap-4">
                  {Boolean(track.explicit) && (
                    <span className="inline-flex rounded-full border border-border bg-muted px-4 py-2 text-xs font-medium text-foreground">
                      Explicit
                    </span>
                  )}
                  <div className="flex-1" />
                  <div className="relative flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Popularity */}
                {artist?.popularity && (
                  <>
                    <div className="rounded-2xl border border-border bg-muted p-5">
                      <PopularityIndicator
                        value={artist.popularity}
                        showLabel
                      />
                    </div>
                    <div className="h-px bg-border" />
                  </>
                )}

                {/* Genres */}
                {genres.length > 0 && (
                  <>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-muted-foreground text-xs uppercase tracking-[0.25em] font-semibold">
                          Genres
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {genres.slice(0, 6).map((genre) => (
                          <GenreTag
                            key={genre}
                            genre={genre}
                            className="border border-border bg-muted text-foreground"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-px bg-border" />
                  </>
                )}

                {/* Release info */}
                {album?.date && (
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

                {/* CTA Button */}
                <a
                  href={track.link}
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
                  <span className="relative z-10">Open in Spotify</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
