import { desc, eq, inArray } from "drizzle-orm";
import { Suspense } from "react";
import { redirect } from "react-router";
import { Artist } from "~/components/domain/artist";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { userContext } from "~/context";
import { artist, top, topArtists, topSongs, track } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { TopSelector } from "~/routes/profile/profile.client";
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
  };
}

export function ServerComponent({ loaderData }: Route.ComponentProps) {
  return (
    <Suspense fallback={<Waver />}>
      <TopSelector type={loaderData.type} range={loaderData.range} />
      <Top
        userId={loaderData.userId}
        range={loaderData.range}
        type={loaderData.type}
      />
    </Suspense>
  );
}

async function Top({
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
    const sortedTracks = trackIds.map((id) => trackMap.get(id)).filter(Boolean);

    const SONGS = sortedTracks.map((track) => (
      <Track track={track!} key={track!.id} />
    ));

    return <div className="flex flex-col gap-2">{SONGS}</div>;
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
      .filter(Boolean);

    const ARTISTS = sortedArtists.map((artist) => (
      <Artist artist={artist!} key={artist!.id} />
    ));

    return <div className="flex flex-col gap-2">{ARTISTS}</div>;
  }
}
