import { Suspense } from "react";
import { redirect } from "react-router";
import { Artist } from "~/components/domain/artist";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { userContext } from "~/context";
import { prisma } from "~/lib/services/db.server";
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
  const top = await prisma.top.findUnique({
    include: {
      songs: {
        include: {
          tracks: true,
        },
        take: 1,
        where: {
          type: range,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      artists: {
        include: {
          artists: true,
        },
        take: 1,
        where: {
          type: range,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    where: {
      userId,
    },
  });

  if (!top) return null;

  const sPos = top.songs[0].trackIds.split(",").reduce(
    (acc, id, i) => {
      acc[id] = i;
      return acc;
    },
    {} as Record<string, number>,
  );

  const songs = top.songs[0].tracks.sort((a, b) => sPos[a.id] - sPos[b.id]);

  const SONGS = songs.map((track) => <Track track={track} key={track.id} />);

  const aPos = top.artists[0].artistIds.split(",").reduce(
    (acc, id, i) => {
      acc[id] = i;
      return acc;
    },
    {} as Record<string, number>,
  );

  const artists =
    top.artists[0].artists.sort((a, b) => aPos[a.id] - aPos[b.id]) || [];

  const ARTISTS = artists.map((artist) => (
    <Artist artist={artist} key={artist.id} />
  ));

  return (
    <div className="flex flex-col gap-2">
      {type === "songs" ? SONGS : ARTISTS}
    </div>
  );
}
