import { getTopLeaderboard } from "server/services/prisma/tracks.server";
import type { Route } from "./+types/home";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: "musy" }, { name: "description", content: "music sharing" }];
}

export async function loader({ context }: Route.LoaderArgs) {
  return { leaderboard: await getTopLeaderboard() };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex flex-col items-center gap-y-10 pt-10">
      <img
        src="/musylogo.png"
        height={100}
        width={100}
        draggable={false}
        className="select-none"
        alt="musy"
      />

      <ul className="flex w-full max-w-sm flex-col gap-y-2">
        {loaderData.leaderboard.map((song, index) => (
          <li key={song.name}>
            <a href={song.uri} className="group flex items-center gap-x-2">
              <span className="basis-6">{index + 1}.</span>
              <div className="flex flex-1 gap-x-2 rounded bg-neutral-950 p-3 transition-colors duration-150 group-hover:bg-neutral-800">
                <img src={song.image} alt={song.name} height={50} width={50} />
                <div>
                  <p>{song.name}</p>
                  <p className="text-neutral-500 text-sm">{song.artist}</p>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
