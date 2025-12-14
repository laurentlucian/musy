import { format, millisecondsToMinutes } from "date-fns";
import { count } from "drizzle-orm";
import { track } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import type { Route } from "./+types/tracks";

export async function loader(_: Route.LoaderArgs) {
  const tracks = await db.select().from(track).limit(100);
  const [{ count: total }] = await db.select({ count: count() }).from(track);
  return { tracks, total };
}

export default function Tracks({
  loaderData: { tracks, total },
}: Route.ComponentProps) {
  return (
    <article className="flex flex-col gap-3 sm:flex-1">
      <div className="overflow-y-hidden">
        <p className="text-muted-foreground text-sm">{total} tracks</p>
        <table className="rounded-lg">
          <thead>
            <tr className="text-left text-muted-foreground text-xs *:p-3">
              <th className="w-20">Name</th>
              <th>Artist</th>
              <th>ID</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => (
              <tr
                key={track.id}
                className="bg-card transition-colors duration-150 *:p-3 hover:bg-accent"
              >
                <td className="capitalize">{track.name}</td>
                <td>{track.artist}</td>
                <td className="text-sm">{track.id}</td>
                <td className="text-sm">
                  {millisecondsToMinutes(track.duration)}m
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tracks.length === 0 && (
        <p className="mx-auto font-semibold text-muted-foreground text-xs">
          NONE
        </p>
      )}
    </article>
  );
}
