import React, { Suspense } from "react";
import { Link, data } from "react-router";
import { Waver } from "~/components/icons/waver";
import { RootMenu } from "~/components/menu/root";
import { TrackMenu } from "~/components/menu/track";
import { Image } from "~/components/ui/image";
import { getCacheControl } from "~/lib/utils";
import { getTopLeaderboard } from "~/services/prisma/tracks.server";
import type { Route } from "./+types/home";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: "musy" }, { name: "description", content: "music sharing" }];
}

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": getCacheControl({ browser: "half-hour", cdn: "hour" }),
  };
}

export function loader({ context }: Route.LoaderArgs) {
  return { leaderboard: getTopLeaderboard() };
}

export default function Home({
  loaderData: { leaderboard },
}: Route.ComponentProps) {
  return (
    <main className="relative isolate flex flex-1 flex-col items-center gap-y-10 py-10">
      <RootMenu />
      <Image src="/musylogo.png" height={200} width={200} alt="musy" />
      <ul className="flex w-full max-w-md flex-col gap-y-2">
        <Suspense fallback={<Waver />}>
          <Leaderboard leaderboard={leaderboard} />
        </Suspense>
      </ul>
    </main>
  );
}
declare module "react" {
  function use<T>(promise: Promise<T>): T;
}

function Leaderboard(props: {
  leaderboard: ReturnType<typeof getTopLeaderboard>;
}) {
  const leaderboard = React.use(props.leaderboard);

  return leaderboard.map((track, index) => {
    return (
      <TrackMenu
        key={track.name}
        query={encodeURIComponent(`${track.name} ${track.artist}`)}
        uri={track.uri}
      >
        <li>
          <Link
            className="group flex items-center gap-x-2"
            to={`/track/${track.id}`}
            viewTransition
          >
            <span className="basis-6">{index + 1}.</span>
            <div className="flex flex-1 gap-x-2 rounded bg-card p-3 transition-colors duration-150 group-hover:bg-accent">
              <Image
                src={track.image}
                alt={track.name}
                height={80}
                width={80}
                className="self-start"
                style={{
                  viewTransitionName: `track-image-${track.id}`,
                }}
              />
              <div>
                <p className="line-clamp-2 text-ellipsis">{track.name}</p>
                <p className="line-clamp-1 text-ellipsis text-muted-foreground text-sm">
                  {track.artist}
                </p>
              </div>
            </div>
          </Link>
        </li>
      </TrackMenu>
    );
  });
}
