import { prisma } from "@lib/services/db.server";
import { href, Link, redirect } from "react-router";
import type { Route } from "./+types/playlists";

export async function loader({ context: { userId } }: Route.LoaderArgs) {
  if (!userId) return redirect("/settings");

  const playlists = await prisma.generatedPlaylist.findMany({
    include: {
      owner: {
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { playlists };
}

export default function Playlists({
  loaderData: { playlists },
}: Route.ComponentProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6 px-12 py-6">
      <div className="flex w-full flex-col items-center gap-2">
        {playlists.map((playlist) => (
          <Link
            key={playlist.id}
            to={href("/generated/:id", {
              id: playlist.id,
            })}
            className="flex w-full max-w-sm flex-col rounded-lg bg-card p-4 hover:bg-card/80"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                {playlist.mood}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                {playlist.year}
              </span>
              {typeof playlist.familiar === "boolean" && (
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                  {playlist.familiar ? "familiar" : "fresh"}
                </span>
              )}
              {typeof playlist.popular === "boolean" && (
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                  {playlist.popular ? "popular" : "unknown"}
                </span>
              )}
            </div>
            <p className="mt-1 text-muted-foreground text-sm">
              by {playlist.owner.user.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
