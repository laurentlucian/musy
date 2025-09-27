import { endOfYear, setYear, startOfYear } from "date-fns";
import { Suspense } from "react";
import { Outlet, redirect } from "react-router";
import { Waver } from "~/components/icons/waver";
import { NumberAnimated } from "~/components/ui/number-animated";
import { userContext } from "~/context";
import { prisma } from "~/lib/services/db.server";
import { Links, Loader, Selector } from "~/routes/profile/profile.client";
import type { Route } from "./+types/profile";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);

  if (!userId) throw redirect("/settings");

  const url = new URL(request.url);
  const year = +(url.searchParams.get("year") ?? "2025");
  const range = url.searchParams.get("range") ?? "long_term";
  const type = url.searchParams.get("type") ?? "songs";

  return {
    userId,
    year,
    range,
    type,
  };
}

export function ServerComponent({ loaderData }: Route.ComponentProps) {
  return (
    <article className="flex flex-1 flex-col gap-6 self-stretch px-6 sm:flex-row sm:items-start">
      <div className="flex flex-1 flex-col gap-4">
        <Avatar userId={loaderData.userId} />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Selector year={loaderData.year} />
          </div>
          <Suspense fallback={<Waver />}>
            <Stats userId={loaderData.userId} year={loaderData.year} />
          </Suspense>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Outlet />
      </div>
    </article>
  );
}

async function Stats({ userId, year }: { userId: string; year: number }) {
  const date = setYear(new Date(), year);

  const liked = await prisma.likedSongs.count({
    where: {
      userId,
      createdAt: {
        gte: startOfYear(date),
        lte: endOfYear(date),
      },
    },
  });

  let length = 0;
  let minutes = 0;
  const artists: Record<string, number> = {};
  const albums: Record<string, number> = {};
  const songs: Record<string, number> = {};

  const take = 2500;
  let skip = 0;
  let all = false;

  while (!all) {
    const played = await prisma.recentSongs.findMany({
      where: {
        userId,
        playedAt: {
          gte: startOfYear(date),
          lte: endOfYear(date),
        },
      },
      take,
      skip,
      orderBy: {
        playedAt: "desc",
      },
      select: {
        track: {
          select: {
            uri: true,
            name: true,
            artist: true,
            albumName: true,
            duration: true,
          },
        },
      },
    });

    if (played.length < take) {
      all = true;
    }

    skip += played.length;
    const batch = calculateStats(played);
    length += batch.played;
    minutes += batch.minutes;

    for (const [artist, count] of Object.entries(batch.artists)) {
      artists[artist] = (artists[artist] ?? 0) + count;
    }
    for (const [album, count] of Object.entries(batch.albums)) {
      albums[album] = (albums[album] ?? 0) + count;
    }
    for (const [song, count] of Object.entries(batch.songs)) {
      songs[song] = (songs[song] ?? 0) + count;
    }
  }

  const { artist, album, song } = getTopItems({
    songs: songs,
    albums: albums,
    artists: artists,
  });

  return (
    <>
      <div className="flex flex-wrap gap-4 whitespace-nowrap">
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-3xl">
            <NumberAnimated value={length} key={year} />
          </p>
          <p className="text-muted-foreground text-sm">songs played</p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-lg bg-card p-4">
            <p className="font-bold text-3xl">
              <NumberAnimated value={liked} key={year} />
            </p>
            <p className="text-muted-foreground text-sm">songs liked</p>
          </div>
        </div>
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-3xl">
            <NumberAnimated value={minutes} key={year} />
          </p>
          <p className="text-muted-foreground text-sm">minutes listened</p>
        </div>
      </div>
      {song && (
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-2xl">{song}</p>
          <p className="text-muted-foreground text-sm">most listened song</p>
        </div>
      )}

      {artist && (
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-2xl">{artist}</p>
          <p className="text-muted-foreground text-sm">most listened artist</p>
        </div>
      )}

      {album && (
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-2xl">{album}</p>
          <p className="text-muted-foreground text-sm">most listened album</p>
        </div>
      )}
    </>
  );
}

async function Avatar({ userId }: { userId: string }) {
  const profile = await prisma.profile.findFirst({
    where: {
      id: userId,
    },
  });

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card p-4">
      <div className="flex items-center gap-2">
        {profile.image && (
          <img
            className="size-10 rounded-full"
            src={profile.image}
            alt={profile.name ?? "pp"}
          />
        )}
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-2xl">{profile.name}</h1>
          <Loader />
        </div>
      </div>
      <p className="text-muted-foreground text-sm">{profile.bio}</p>
      <Links userId={userId} />
    </div>
  );
}

function getTopItems(arg: {
  artists: Record<string, number>;
  albums: Record<string, number>;
  songs: Record<string, number>;
}) {
  const artist = Object.entries(arg.artists).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  const album = Object.entries(arg.albums).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  const song = Object.entries(arg.songs).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  return { artist, album, song };
}

function calculateStats(
  played: {
    track: {
      name: string;
      albumName: string;
      artist: string;
      duration: number;
    };
  }[],
) {
  const minutes = played.reduce(
    (acc, curr) => acc + curr.track.duration / 60_000,
    0,
  );

  const artists = played.reduce(
    (acc, { track }) => {
      acc[track.artist] = (acc[track.artist] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const albums = played.reduce(
    (acc, { track }) => {
      acc[track.albumName] = (acc[track.albumName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const songs = played.reduce(
    (acc, { track }) => {
      acc[track.name] = (acc[track.name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return { minutes, artists, albums, songs, played: played.length };
}
