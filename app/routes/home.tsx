import React, { Suspense } from "react";
import { Waver } from "~/components/icons/waver";
import { RootMenu } from "~/components/menu/root";
import { TrackMenu } from "~/components/menu/track";
import { getTopLeaderboard } from "~/services/prisma/tracks.server";
import type { Route } from "./+types/home";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: "musy" }, { name: "description", content: "music sharing" }];
}

export function loader({ context }: Route.LoaderArgs) {
  return { leaderboard: getTopLeaderboard() };
}

export default function Home({
  loaderData: { leaderboard },
}: Route.ComponentProps) {
  return (
    <main className="relative isolate flex flex-1 flex-col items-center gap-y-10 pt-10 outline">
      <RootMenu />
      <img
        src="/musylogo.png"
        height={200}
        width={200}
        draggable={false}
        className="select-none"
        alt="musy"
      />
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

  return leaderboard.map((song, index) => {
    return (
      <TrackMenu
        key={song.name}
        query={encodeURIComponent(`${song.name} ${song.artist}`)}
        uri={song.uri}
      >
        <li className="group flex items-center gap-x-2">
          <span className="basis-6">{index + 1}.</span>
          <div className="flex flex-1 gap-x-2 rounded bg-card p-3 transition-colors duration-150 group-hover:bg-accent">
            <img
              draggable={false}
              src={song.image}
              alt={song.name}
              height={80}
              width={80}
              className="self-start rounded"
            />
            <div>
              <p className="line-clamp-2 text-ellipsis">{song.name}</p>
              <p className="line-clamp-1 text-ellipsis text-foreground text-sm">
                {song.artist}
              </p>
            </div>
          </div>
        </li>
      </TrackMenu>
    );
  });
}
