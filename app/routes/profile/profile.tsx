import { endOfYear, setYear, startOfYear } from "date-fns";
import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import { Suspense, use } from "react";
import { data, Outlet, redirect } from "react-router";
import { Waver } from "~/components/icons/waver";
import { Image } from "~/components/ui/image";
import { NumberAnimated } from "~/components/ui/number-animated";
import { userContext } from "~/context";
import { likedSongs, profile, recentSongs, track } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { syncUserPlaylists } from "~/lib/services/scheduler/scripts/sync/playlist.server";
import { syncUserProfile } from "~/lib/services/scheduler/scripts/sync/profile.server";
import { syncUserRecent } from "~/lib/services/scheduler/scripts/sync/recent.server";
import { syncUserTop } from "~/lib/services/scheduler/scripts/sync/top.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";
import {
  Links,
  Loader,
  Selector,
  SyncButton,
} from "~/routes/profile/utils/profile.utils";
import type { Route } from "./+types/profile";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);
  const currentUserId = context.get(userContext);

  if (!userId) throw redirect("/");

  const url = new URL(request.url);
  const year = +(url.searchParams.get("year") ?? "2025");

  return {
    userId,
    currentUserId,
    year,
    profile: getProfile(userId),
    stats: getStats(userId, year),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const currentUserId = context.get(userContext);
  if (!currentUserId) {
    return data({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = formData.get("userId");

  if (intent !== "sync" || userId !== currentUserId) {
    return data({ success: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    const spotify = await getSpotifyClient({ userId });
    await Promise.all([
      syncUserProfile({ userId, spotify }),
      syncUserRecent({ userId, spotify }),
      syncUserTop({ userId, spotify }),
      syncUserPlaylists({ userId, spotify }),
    ]);
    return data({ success: true });
  } catch (error) {
    return data(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  return (
    <article className="flex flex-1 flex-col gap-6 self-stretch px-6 py-2 sm:flex-row sm:items-start">
      <div className="flex flex-1 flex-col gap-4">
        <Suspense
          fallback={
            <div className="mx-auto py-10">
              <Waver />
            </div>
          }
        >
          <Avatar
            promise={loaderData.profile}
            userId={loaderData.userId}
            currentUserId={loaderData.currentUserId}
          />
        </Suspense>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Selector year={loaderData.year} />
          </div>
          <Suspense fallback={<Waver />}>
            <Stats promise={loaderData.stats} year={loaderData.year} />
          </Suspense>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Outlet />
      </div>
    </article>
  );
}

function Stats({
  promise,
  year,
}: {
  promise: ReturnType<typeof getStats>;
  year: number;
}) {
  const data = use(promise);

  return (
    <>
      <div className="flex flex-wrap gap-4 whitespace-nowrap">
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-3xl">
            <NumberAnimated value={data.played} key={year} />
          </p>
          <p className="text-muted-foreground text-sm">songs played</p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-lg bg-card p-4">
            <p className="font-bold text-3xl">
              <NumberAnimated value={data.liked} key={year} />
            </p>
            <p className="text-muted-foreground text-sm">songs liked</p>
          </div>
        </div>
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-3xl">
            <NumberAnimated value={data.minutes} key={year} />
          </p>
          <p className="text-muted-foreground text-sm">minutes listened</p>
        </div>
      </div>
      {data.song && (
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-2xl">{data.song}</p>
          <p className="text-muted-foreground text-sm">most listened song</p>
        </div>
      )}

      {data.artist && (
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-2xl">{data.artist}</p>
          <p className="text-muted-foreground text-sm">most listened artist</p>
        </div>
      )}

      {data.album && (
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-2xl">{data.album}</p>
          <p className="text-muted-foreground text-sm">most listened album</p>
        </div>
      )}
    </>
  );
}

function Avatar({
  promise,
  userId,
  currentUserId,
}: {
  promise: ReturnType<typeof getProfile>;
  userId: string;
  currentUserId: string | null;
}) {
  const data = use(promise);

  if (!data) return null;

  const isOwnProfile = currentUserId === userId;

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card p-4">
      <div className="flex items-center gap-2">
        {data.image && (
          <Image
            className="size-10 rounded-full"
            src={data.image}
            alt={data.name ?? "pp"}
            name={data.name}
          />
        )}
        <div className="flex w-full items-center gap-2">
          <h1 className="font-bold text-2xl">{data.name}</h1>
          <Loader />
          {isOwnProfile && <SyncButton userId={userId} />}
        </div>
      </div>
      <p className="text-muted-foreground text-sm">{data.bio}</p>
      <Links userId={userId} />
    </div>
  );
}

async function getProfile(userId: string) {
  return db.query.profile.findFirst({
    where: eq(profile.id, userId),
  });
}

async function getStats(userId: string, year: number) {
  const date = setYear(new Date(), year);

  const [{ count: liked }] = await db
    .select({ count: count() })
    .from(likedSongs)
    .where(
      and(
        eq(likedSongs.userId, userId),
        gte(likedSongs.createdAt, startOfYear(date).toISOString()),
        lte(likedSongs.createdAt, endOfYear(date).toISOString()),
      ),
    );

  let played = 0;
  let minutes = 0;
  const artists: Record<string, number> = {};
  const albums: Record<string, number> = {};
  const songs: Record<string, number> = {};

  const take = 2500;
  let skip = 0;
  let all = false;

  while (!all) {
    const rows = await db
      .select({
        track: {
          uri: track.uri,
          name: track.name,
          artist: track.artist,
          albumName: track.albumName,
          duration: track.duration,
        },
      })
      .from(recentSongs)
      .innerJoin(track, eq(recentSongs.trackId, track.id))
      .where(
        and(
          eq(recentSongs.userId, userId),
          gte(recentSongs.playedAt, startOfYear(date).toISOString()),
          lte(recentSongs.playedAt, endOfYear(date).toISOString()),
        ),
      )
      .orderBy(desc(recentSongs.playedAt))
      .limit(take)
      .offset(skip);

    if (rows.length < take) {
      all = true;
    }

    skip += rows.length;
    const batch = calculateStats(rows);
    played += batch.played;
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

  const topItems = getTopItems({ songs, albums, artists });

  return {
    liked,
    played,
    minutes,
    artist: topItems.artist,
    album: topItems.album,
    song: topItems.song,
  };
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
  rows: {
    track: {
      name: string;
      albumName: string;
      artist: string;
      duration: number;
    };
  }[],
) {
  const minutes = rows.reduce(
    (acc, curr) => acc + curr.track.duration / 60_000,
    0,
  );

  const artists = rows.reduce(
    (acc, { track }) => {
      acc[track.artist] = (acc[track.artist] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const albums = rows.reduce(
    (acc, { track }) => {
      acc[track.albumName] = (acc[track.albumName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const songs = rows.reduce(
    (acc, { track }) => {
      acc[track.name] = (acc[track.name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return { minutes, artists, albums, songs, played: rows.length };
}
