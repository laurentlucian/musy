import { ArrowLeft, Users, Mic2 } from "lucide-react";
import { data, useNavigate } from "react-router";
import { ArtistImage, ArtistName } from "~/components/domain/artist";
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
            <Mic2 className="h-4 w-4 text-foreground" />
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              Artist
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
              <ArtistImage
                id={artist.id}
                src={artist.image}
                alt={artist.name}
                width={500}
                height={500}
                className="relative rounded-full"
              />
            </div>

            <div className="mt-12 flex w-full max-w-lg flex-col items-center gap-y-5 text-center">
              <ArtistName
                name={artist.name}
                uri={artist.uri}
                className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight"
              />

              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-muted px-6 py-3">
                <Users className="h-5 w-5 text-foreground" />
                <div className="flex flex-col items-start">
                  <span className="text-xl font-bold text-foreground">
                    {formatFollowers(artist.followers)}
                  </span>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">
                    Followers
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details card */}
          <div className="xl:pl-8">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="relative z-10 flex flex-col gap-8">
                {/* Popularity */}
                {artist.popularity > 0 && (
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
                        {genres.map((genre) => (
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

                {/* External link */}
                <a
                  href={artist.uri}
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
