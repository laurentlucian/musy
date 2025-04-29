import { prisma } from "@lib/services/db.server";
import { data, redirect } from "react-router";
import { Track } from "~/components/domain/track";
import type { Route } from "./+types/generated";

export async function loader({
  params,
  context: { userId },
}: Route.LoaderArgs) {
  if (!userId) return redirect("/account");

  const playlist = await prisma.aIPlaylist.findUnique({
    include: {
      tracks: true,
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
    where: {
      id: params.id,
    },
  });

  if (!playlist) throw data("not found", { status: 404 });

  return { playlist };
}

export default function Mood({
  loaderData: { playlist },
}: Route.ComponentProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex w-full max-w-md flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="w-fit rounded-lg bg-card px-3 py-2 text-sm">
            {playlist.mood} {playlist.year}
          </p>
          <p className="text-muted-foreground text-sm">
            by {playlist.owner.user.name}
          </p>
        </div>

        {playlist.tracks.map((track) => (
          <Track key={track.id} {...track} />
        ))}
      </div>
    </div>
  );
}
