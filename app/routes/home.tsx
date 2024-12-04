import { Suspense, use } from "react";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { RootMenu } from "~/components/menu/root";
import { Image } from "~/components/ui/image";
import { getCacheControl } from "~/lib/utils";
import { getTopLeaderboard } from "~/services/prisma/tracks.server";
import type { Route } from "./+types/home";

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

function Leaderboard(props: {
  leaderboard: ReturnType<typeof getTopLeaderboard>;
}) {
  const leaderboard = use(props.leaderboard);

  return leaderboard.map((track, index) => {
    return (
      <li key={track.id} className="flex items-center gap-x-2">
        <span className="basis-6 font-bold">{index + 1}.</span>
        <Track
          id={track.id}
          uri={track.uri}
          image={track.image}
          artist={track.artist}
          name={track.name}
        />
      </li>
    );
  });
}
