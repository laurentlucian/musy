import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { data, Link, useNavigate } from "react-router";
import { TrackImage } from "~/components/domain/track";
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

type TrackData = NonNullable<Awaited<ReturnType<typeof getTrack>>>;

function getArtistName(track: TrackData): string {
  return track.artists?.[0]?.artist?.name || "Unknown";
}

function getArtistId(track: TrackData): string | undefined {
  return track.artists?.[0]?.artist?.id;
}

function getArtistUri(track: TrackData): string {
  return track.artists?.[0]?.artist?.uri || track.uri;
}

function getArtist(track: TrackData) {
  return track.artists?.[0]?.artist || null;
}

function getAlbum(track: TrackData) {
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
          <TrackImage
            id={track.id}
            src={track.image}
            alt={track.name}
            width={500}
            height={500}
            className="aspect-square h-auto w-full rounded-none object-cover shadow-[0_12px_32px_-16px_rgba(37,40,32,0.35)]"
          />
        </div>
        <div className="min-w-0">
          <p className="mb-4 text-xs font-medium uppercase text-primary">
            Track
          </p>
          <h1 className="font-semibold text-2xl leading-[1.05] tracking-tight sm:text-2xl lg:text-3xl">
            {track.name}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-lg text-muted-foreground">
            {getArtistId(track) ? (
              <Link
                to={`/artist/${getArtistId(track)}`}
                className="hover:text-primary"
                viewTransition
              >
                {getArtistName(track)} →
              </Link>
            ) : (
              <a
                href={getArtistUri(track)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                {getArtistName(track)} ↗
              </a>
            )}
          </div>
          <div className="my-7 flex flex-wrap gap-2">
            <a
              href={track.link}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "lg", className: "gap-2" })}
            >
              Open in Spotify <ArrowUpRight className="size-4" />
            </a>
            <TrackLikeButton uri={track.uri} provider={track.provider} />
            <TrackQueueButton uri={track.uri} provider={track.provider} />
          </div>
          <div className="space-y-6">
            <dl className="divide-y divide-border border-y border-border text-sm">
              <div className="flex justify-between gap-6 py-4">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="tabular-nums">
                  {formatDuration(track.duration)}
                </dd>
              </div>
              {album && (
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-muted-foreground">Album</dt>
                  <dd className="text-right">
                    <Link
                      to={`/album/${album.id}`}
                      viewTransition
                      className="hover:text-primary"
                    >
                      {album.name} →
                    </Link>
                  </dd>
                </div>
              )}
              {album?.date && (
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-muted-foreground">Released</dt>
                  <dd>{formatDate(album.date)}</dd>
                </div>
              )}
              {Boolean(track.explicit) && (
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-muted-foreground">Content</dt>
                  <dd>Explicit</dd>
                </div>
              )}
            </dl>
            {artist?.popularity != null && (
              <div>
                <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  Artist popularity
                </p>
                <PopularityIndicator value={artist.popularity} showLabel />
              </div>
            )}
            {genres.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  Genres
                </h2>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <GenreTag key={genre} genre={genre} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
