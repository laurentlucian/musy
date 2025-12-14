import { desc, eq, inArray } from "drizzle-orm";
import { Suspense } from "react";
import { Await, redirect } from "react-router";
import { Artist } from "~/components/domain/artist";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { userContext } from "~/context";
import { artist, top, topArtists, topSongs, track } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { TopSelector } from "~/routes/profile/profile.selectors";
import type { Route } from "./+types/profile.index";

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
    topData: getTopData({ userId, range, type }),
  };
}

export default function ProfileIndex({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <TopSelector type={loaderData.type} range={loaderData.range} />
      <Suspense fallback={<Waver />}>
        <Await resolve={loaderData.topData}>
          {(data) => <TopList data={data} type={loaderData.type} />}
        </Await>
      </Suspense>
    </>
  );
}

function TopList({
  data,
  type,
}: {
  data: Awaited<ReturnType<typeof getTopData>>;
  type: string;
}) {
  if (!data) return null;

  if (type === "songs") {
    const tracks = data.tracks;
    if (!tracks) return null;
    return (
      <div className="flex flex-col gap-2">
        {tracks.map((track) => (
          <Track track={track} key={track.id} />
        ))}
      </div>
    );
  } else {
    const artists = data.artists;
    if (!artists) return null;
    return (
      <div className="flex flex-col gap-2">
        {artists.map((artist) => (
          <Artist artist={artist} key={artist.id} />
        ))}
      </div>
    );
  }
}

async function getTopData({
  userId,
  range,
  type,
}: {
  userId: string;
  range: string;
  type: string;
}) {
  // Check if top record exists for user
  const topRecord = await db.query.top.findFirst({
    where: eq(top.userId, userId),
  });

  if (!topRecord) return null;

  if (type === "songs") {
    // Get top songs for this range
    const songsRecord = await db.query.topSongs.findFirst({
      where: eq(topSongs.userId, userId),
      orderBy: desc(topSongs.createdAt),
    });

    if (!songsRecord) return null;

    // Get tracks based on trackIds
    const trackIds = songsRecord.trackIds.split(",");
    const tracks = await db
      .select()
      .from(track)
      .where(inArray(track.id, trackIds));

    // Sort tracks according to their position in trackIds
    const trackMap = new Map(tracks.map((t) => [t.id, t]));
    const sortedTracks = trackIds
      .map((id) => trackMap.get(id))
      .filter(Boolean) as typeof tracks;

    return { tracks: sortedTracks };
  } else {
    // Get top artists for this range
    const artistsRecord = await db.query.topArtists.findFirst({
      where: eq(topArtists.userId, userId),
      orderBy: desc(topArtists.createdAt),
    });

    if (!artistsRecord) return null;

    // Get artists based on artistIds
    const artistIds = artistsRecord.artistIds.split(",");
    const artists = await db
      .select()
      .from(artist)
      .where(inArray(artist.id, artistIds));

    // Sort artists according to their position in artistIds
    const artistMap = new Map(artists.map((a) => [a.id, a]));
    const sortedArtists = artistIds
      .map((id) => artistMap.get(id))
      .filter(Boolean) as typeof artists;

    return { artists: sortedArtists };
  }
}
