import { desc, eq } from "drizzle-orm";
import { href, Link, redirect } from "react-router";
import { userContext } from "~/context";
import { generated, generatedPlaylist, profile, user } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import type { Route } from "./+types/playlists";

export async function loader({ context }: Route.LoaderArgs) {
  const userId = context.get(userContext);
  if (!userId) return redirect("/settings");

  const playlists = await db
    .select({
      id: generatedPlaylist.id,
      mood: generatedPlaylist.mood,
      year: generatedPlaylist.year,
      familiar: generatedPlaylist.familiar,
      popular: generatedPlaylist.popular,
      createdAt: generatedPlaylist.createdAt,
      owner: {
        user: {
          name: profile.name,
        },
      },
    })
    .from(generatedPlaylist)
    .innerJoin(generated, eq(generatedPlaylist.ownerId, generated.id))
    .innerJoin(user, eq(generated.userId, user.id))
    .innerJoin(profile, eq(user.id, profile.id))
    .orderBy(desc(generatedPlaylist.createdAt));

  return { playlists };
}

export function ServerComponent({
  loaderData: { playlists },
}: Route.ComponentProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6 px-12 py-6">
      <div className="flex w-full flex-col items-center gap-2">
        {playlists.map((playlist) => (
          <Link
            key={playlist.id}
            to={href("/playlists/:id", {
              id: playlist.id,
            })}
            className="flex w-full max-w-sm flex-col gap-3 rounded-lg bg-card p-4 hover:bg-card/80"
          >
            <div className="flex items-center gap-2 *:rounded-full *:bg-primary/10 *:px-2.5 *:py-1 *:font-medium *:text-xs">
              <span>{playlist.mood}</span>
              <span>{playlist.year}</span>
              {typeof playlist.familiar === "boolean" && (
                <span>{playlist.familiar ? "familiar" : "fresh"}</span>
              )}
              {typeof playlist.popular === "boolean" && (
                <span>{playlist.popular ? "popular" : "unknown"}</span>
              )}
            </div>
            <p className="w-fit rounded-full bg-foreground px-2.5 py-1 font-semibold text-background text-xs">
              by {playlist.owner.user.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
