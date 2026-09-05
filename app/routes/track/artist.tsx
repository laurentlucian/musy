import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { data, useNavigate } from "react-router";
import { ArtistImage } from "~/components/domain/artist";
import { GenreTag, PopularityIndicator } from "~/components/ui";
import { Button, buttonVariants } from "~/components/ui/button";
import { ellipsis, formatFollowers, parseGenres } from "~/components/utils";
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
  const genres = parseGenres(artist.genres);

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
          <ArtistImage
            id={artist.id}
            src={artist.image}
            alt={artist.name}
            width={500}
            height={500}
            className="aspect-square h-auto w-full rounded-none object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="mb-4 font-medium text-primary text-xs uppercase">
            Artist
          </p>
          <h1 className="font-semibold text-2xl leading-tight tracking-tight sm:text-2xl lg:text-3xl">
            {artist.name}
          </h1>

          <div className="my-7 flex flex-wrap gap-2">
            <a
              href={artist.uri}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "lg", className: "gap-2" })}
            >
              Open in Spotify <ArrowUpRight className="size-4" />
            </a>
          </div>
          <div className="space-y-6">
            <dl className="border-border border-y text-sm">
              <div className="flex items-baseline justify-between py-4">
                <dt className="text-muted-foreground">Followers</dt>
                <dd className="font-semibold text-3xl">
                  {formatFollowers(artist.followers)}
                </dd>
              </div>
            </dl>
            <PopularityIndicator value={artist.popularity} showLabel />
            {genres.length > 0 && (
              <div>
                <h2 className="mb-3 font-medium text-muted-foreground text-sm">
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
