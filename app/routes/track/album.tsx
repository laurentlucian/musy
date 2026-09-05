import { ArrowLeft, Disc, ExternalLink, Disc3 } from "lucide-react";
import { data, Link, useNavigate } from "react-router";
import { AlbumImage, AlbumName } from "~/components/domain/album";
import { MetadataItem, PopularityIndicator } from "~/components/ui";
import { Button } from "~/components/ui/button";
import { cn, ellipsis, formatDate } from "~/components/utils";
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
          <div className="group/badge flex items-center gap-2 rounded-full border border-border/50 bg-card/60 backdrop-blur-md px-4 py-2 transition-all duration-300">
            <Disc3 className="h-4 w-4 text-[hsl(138,76%,55%)]" />
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Album</span>
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
              <AlbumImage
                id={album.id}
                src={album.image}
                alt={album.name}
                width={500}
                height={500}
                className="relative animate-fade-in rounded-3xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.6)] transition-all duration-500"
              />
            </div>

            <div className="mt-12 flex w-full max-w-lg flex-col items-center gap-y-5 text-center animate-fade-in animation-delay-200">
              <AlbumName name={album.name} uri={album.uri} className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight drop-shadow-sm transition-all duration-500 hover:drop-shadow-md" />

              {artistId ? (
                <Link
                  to={`/artist/${artistId}`}
                  viewTransition
                  className="group/link inline-flex items-center text-[clamp(1.1rem,2.5vw,1.5rem)] text-[hsl(138,76%,55%)] transition-all duration-300 hover:text-[hsl(138,76%,47%)] hover:drop-shadow-[0_0_25px_hsla(138,76%,47%,0.6)] hover:scale-105"
                >
                  {artistName}
                  <span className="ml-2 inline-block transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:scale-110">→</span>
                </Link>
              ) : (
                <a
                  href={artistUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center text-[clamp(1.1rem,2.5vw,1.5rem)] text-[hsl(138,76%,55%)] transition-all duration-300 hover:text-[hsl(138,76%,47%)] hover:drop-shadow-[0_0_25px_hsla(138,76%,47%,0.6)] hover:scale-105"
                  onClick={(e) => e.stopPropagation()}
                >
                  {artistName}
                  <span className="ml-2 inline-block transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:scale-110">↗</span>
                </a>
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
                  <span
                    className={cn(
                      "inline-flex rounded-full px-4 py-2 font-medium text-xs border transition-all duration-300 shadow-sm",
                      album.type === "album"
                        ? "bg-gradient-to-br from-[hsl(138,76%,47%)]/20 to-[hsl(138,76%,55%)]/10 text-[hsl(138,76%,55%)] border-[hsl(138,76%,47%)]/30"
                        : album.type === "single"
                          ? "bg-gradient-to-br from-[hsl(138,76%,47%)]/15 to-[hsl(138,76%,55%)]/8 text-[hsl(138,76%,55%)] border-[hsl(138,76%,47%)]/20"
                          : "bg-muted-foreground/20 text-muted-foreground border-border/30",
                    )}
                  >
                    {getAlbumTypeLabel(album.type)}
                  </span>
                  <div className="group/tracks inline-flex items-center gap-2 rounded-full border border-[hsl(138,76%,47%)]/30 bg-[hsl(138,76%,47%)]/5 px-4 py-2 transition-all duration-300">
                    <Disc className="h-4 w-4 text-[hsl(138,76%,55%)]" />
                    <span className="text-sm font-medium">{album.total} tracks</span>
                  </div>
                  <div className="flex-1" />
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                {/* Popularity */}
                {album.popularity > 0 && (
                  <>
                    <div className="rounded-2xl border border-border/40 bg-muted/40 backdrop-blur-sm p-5 transition-all duration-300">
                      <PopularityIndicator value={album.popularity} showLabel />
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                  </>
                )}

                {/* Release info */}
                {album.date && (
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

                {/* External link */}
                <a
                  href={album.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-[hsl(138,76%,47%)]/40 bg-[hsl(138,76%,47%)]/8 px-10 py-4 font-semibold text-base transition-all duration-300 hover:border-[hsl(138,76%,47%)]/60 hover:bg-[hsl(138,76%,47%)]/15 hover:shadow-[0_10px_50px_hsla(138,76%,47%,0.5)] hover:-translate-y-1 active:translate-y-0"
                >
                  {/* Shimmer effect overlay */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover/link:translate-x-full" />
                  {/* Subtle inner glow */}
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover/link:opacity-100" />
                  <img
                    src="/spotify/icon-white.png"
                    alt="Spotify"
                    className="h-6 w-6 transition-transform duration-300 group-hover/link:scale-110 group-hover/link:rotate-6"
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
