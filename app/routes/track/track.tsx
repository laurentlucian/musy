import { ArrowLeft, ExternalLink, Music2 } from "lucide-react";
import { data, Link, useNavigate } from "react-router";
import { TrackImage, TrackName } from "~/components/domain/track";
import {
  TrackLikeButton,
  TrackQueueButton,
} from "~/components/domain/track-actions";
import { GenreTag, MetadataItem, PopularityIndicator } from "~/components/ui";
import { Button } from "~/components/ui/button";
import {
  cn,
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
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[1000] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Animated background gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-50%] left-[-50%] h-[200%] w-[200%] animate-float bg-[radial-gradient(ellipse_at_30%_20%,hsla(138,76%,47%,0.18)_0%,transparent_50%)]" />
        <div className="absolute right-[-50%] bottom-[-50%] h-[200%] w-[200%] animate-float-slow bg-[radial-gradient(ellipse_at_70%_80%,hsla(138,76%,55%,0.12)_0%,transparent_50%)]" />
        {/* Subtle ambient pulse */}
        <div className="absolute inset-0 animate-pulse-slow bg-[radial-gradient(circle_at_50%_50%,hsla(138,76%,47%,0.03)_0%,transparent_70%)]" />
      </div>

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
            className="group gap-2 transition-all duration-300 hover:bg-[hsl(138,76%,47%)]/15 hover:text-[hsl(138,76%,47%)] hover:shadow-[0_0_20px_hsla(138,76%,47%,0.2)]"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-x-2">
            <div className="group/badge flex items-center gap-2 rounded-full border border-border/50 bg-card/60 backdrop-blur-md px-4 py-2 transition-all duration-300">
              <Music2 className="h-4 w-4 text-[hsl(138,76%,55%)]" />
              <span className="text-muted-foreground text-xs uppercase tracking-wider">Track</span>
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
              {/* Ambient background glow */}
              <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-[hsl(138,76%,47%)]/12 via-[hsl(138,76%,55%)]/6 to-transparent blur-[70px] transition-all duration-700" />
              {/* Multi-layered glow effect */}
              <div className="absolute -inset-6 rounded-[2.5rem] bg-[hsl(138,76%,47%)]/25 blur-[90px] transition-all duration-700" />
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[hsl(138,76%,47%)]/12 to-[hsl(138,76%,55%)]/6 blur-[50px] transition-all duration-700" />
              <TrackImage
                id={track.id}
                src={track.image}
                alt={track.name}
                width={500}
                height={500}
                className="relative animate-fade-in rounded-3xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.6)] transition-all duration-500"
              />
            </div>

            <div className="mt-12 flex w-full max-w-lg flex-col items-center gap-y-5 text-center animate-fade-in animation-delay-200">
              <TrackName name={track.name} uri={track.uri} className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight drop-shadow-sm transition-all duration-500 hover:drop-shadow-md" />

              {getArtistId(track) ? (
                <Link
                  to={`/artist/${getArtistId(track)}`}
                  viewTransition
                  className="group/link inline-flex items-center text-[clamp(1.1rem,2.5vw,1.5rem)] text-[hsl(138,76%,55%)] transition-all duration-300 hover:text-[hsl(138,76%,47%)] hover:drop-shadow-[0_0_25px_hsla(138,76%,47%,0.6)] hover:scale-105"
                >
                  {getArtistName(track)}
                  <span className="ml-2 inline-block transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:scale-110">→</span>
                </Link>
              ) : (
                <a
                  href={getArtistUri(track)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center text-[clamp(1.1rem,2.5vw,1.5rem)] text-[hsl(138,76%,55%)] transition-all duration-300 hover:text-[hsl(138,76%,47%)] hover:drop-shadow-[0_0_25px_hsla(138,76%,47%,0.6)] hover:scale-105"
                  onClick={(e) => e.stopPropagation()}
                >
                  {getArtistName(track)}
                  <span className="ml-2 inline-block transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:scale-110">↗</span>
                </a>
              )}

              {album && (
                <div className="flex items-center gap-2 text-muted-foreground/80">
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-current" />
                  {getAlbumId(album) ? (
                    <Link
                      to={`/album/${getAlbumId(album)}`}
                      viewTransition
                      className="text-base transition-all duration-300 hover:text-foreground hover:underline hover:drop-shadow-sm"
                    >
                      {getAlbumName(album)}
                    </Link>
                  ) : (
                    <a
                      href={getAlbumUri(album)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base transition-all duration-300 hover:text-foreground hover:underline hover:drop-shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getAlbumName(album)}
                    </a>
                  )}
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-current" />
                </div>
              )}
            </div>
          </div>

          {/* Right: Details card */}
          <div className="animate-fade-in animation-delay-400 xl:pl-8">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/80 p-8 backdrop-blur-xl shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 sm:p-10">
              {/* Animated gradient overlay */}
              <div className="pointer-events-none absolute -top-[50%] -left-[50%] h-[200%] w-[200%] animate-rotate-slow opacity-50"
                style={{
                  background: `conic-gradient(from 0deg at 50% 50%, hsla(138,76%,47%,0.25) 0deg, transparent 60deg, hsla(138,76%,55%,0.25) 120deg, transparent 180deg, hsla(138,76%,47%,0.25) 240deg, transparent 300deg)`,
                }}
              />
              {/* Subtle noise texture overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] opacity-[0.02] mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />

              <div className="relative z-10 flex flex-col gap-8">
                {/* Header badges */}
                <div className="flex flex-wrap items-center gap-4">
                  {Boolean(track.explicit) && (
                    <span className="inline-flex rounded-full bg-gradient-to-br from-[hsl(138,76%,47%)]/25 via-[hsl(138,76%,55%)]/15 to-[hsl(138,76%,47%)]/20 px-4 py-2 font-medium text-xs text-[hsl(138,76%,55%)] border border-[hsl(138,76%,47%)]/40 shadow-[0_0_20px_hsla(138,76%,47%,0.35)]">
                      Explicit
                    </span>
                  )}
                  <div className="flex-1" />
                  <div className="group/duration relative flex items-center gap-2 rounded-full border border-border/40 bg-muted/60 backdrop-blur-sm px-4 py-2 transition-all duration-300">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium">{formatDuration(track.duration)}</span>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                {/* Popularity */}
                {artist?.popularity && (
                  <>
                    <div className="rounded-2xl border border-border/40 bg-muted/40 backdrop-blur-sm p-5 transition-all duration-300">
                      <PopularityIndicator value={artist.popularity} showLabel />
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                  </>
                )}

                {/* Genres */}
                {genres.length > 0 && (
                  <>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[hsl(138,76%,47%)]/60" />
                        <span className="text-muted-foreground text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300">
                          Genres
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[hsl(138,76%,47%)]/60" />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {genres.slice(0, 6).map((genre, index) => (
                          <GenreTag
                            key={genre}
                            genre={genre}
                            className="animate-fade-in relative overflow-hidden bg-gradient-to-br from-[hsl(138,76%,47%)]/20 via-[hsl(138,76%,55%)]/12 to-[hsl(138,76%,47%)]/15 text-[hsl(138,76%,55%)] transition-all duration-300 border border-[hsl(138,76%,47%)]/40 shadow-sm"
                            style={{ animationDelay: `${index * 50}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                  </>
                )}

                {/* Release info */}
                {album?.date && (
                  <>
                    <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/40 p-5 transition-all duration-300">
                      <span className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-semibold">
                        Release Date
                      </span>
                      <span className="font-mono text-foreground text-sm">
                        {formatDate(album.date)}
                      </span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                  </>
                )}

                {/* CTA Button */}
                <a
                  href={track.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-[hsl(138,76%,47%)]/45 bg-gradient-to-br from-[hsl(138,76%,47%)]/10 to-[hsl(138,76%,55%)]/5 px-10 py-4 font-semibold text-base transition-all duration-300 hover:border-[hsl(138,76%,47%)]/65 hover:bg-gradient-to-br hover:from-[hsl(138,76%,47%)]/18 hover:to-[hsl(138,76%,55%)]/10 hover:shadow-[0_15px_60px_hsla(138,76%,47%,0.55)] hover:-translate-y-1 active:translate-y-0"
                >
                  {/* Shimmer effect overlay */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/link:translate-x-full" />
                  {/* Subtle inner glow */}
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/8 to-transparent opacity-0 transition-opacity duration-500 group-hover/link:opacity-100" />
                  {/* Ambient ring effect */}
                  <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10 opacity-0 transition-opacity duration-500 group-hover/link:opacity-100" />
                  <img
                    src="/spotify/icon-white.png"
                    alt="Spotify"
                    className="h-6 w-6 transition-transform duration-300 group-hover/link:scale-110 group-hover/link:rotate-6"
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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
