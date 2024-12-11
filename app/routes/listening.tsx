import { prisma } from "@lib/services/db.server";
import { Track } from "~/components/domain/track";
import type { Route } from "./+types/listening";

export async function loader(_: Route.LoaderArgs) {
  const playbacks = await prisma.playback.findMany({
    select: {
      track: true,
    },
    orderBy: {
      track: {
        recent: {
          _count: "desc",
        },
      },
    },
  });

  return { playbacks };
}

export default function Listening({
  loaderData: { playbacks },
}: Route.ComponentProps) {
  return (
    <ul className="flex w-full max-w-md flex-col gap-y-2">
      {playbacks.map(({ track }, index) => {
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
      })}
    </ul>
  );
}
