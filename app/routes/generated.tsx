import { prisma } from "@lib/services/db.server";
import { getTracksFromMood } from "@lib/services/sdk/helpers/ai.server";
import { RefreshCwIcon } from "lucide-react";
import { data, Form, href, Link, redirect, useNavigation } from "react-router";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/generated";

export async function loader({
  params,
  context: { userId },
}: Route.LoaderArgs) {
  if (!userId) return redirect("/settings");

  const playlist = await prisma.generatedPlaylist.findUnique({
    include: {
      tracks: true,
      owner: {
        select: {
          user: {
            select: {
              id: true,
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

  return { playlist, userId };
}

export default function Mood({
  loaderData: { playlist, userId },
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isOwner = userId === playlist.owner.user.id;
  const loading = navigation.state === "submitting";

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex w-full max-w-md flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="w-fit rounded-lg bg-card px-3 py-2 text-sm">
            {playlist.mood} {playlist.year}
          </p>
          <p className="text-muted-foreground text-sm">
            by{" "}
            <Link
              to={href("/profile/:userId?", { userId: playlist.owner.user.id })}
              className="hover:underline"
            >
              {playlist.owner.user.name}
            </Link>
          </p>
          {isOwner && (
            <Form method="post" className="ml-auto">
              <input type="hidden" value={playlist.mood} name="mood" />
              <input type="hidden" value={playlist.year} name="year" />
              <Button size="icon" className="ml-auto" disabled={loading}>
                {loading ? <Waver /> : <RefreshCwIcon />}
              </Button>
            </Form>
          )}
        </div>

        {playlist.tracks.map((track) => (
          <Track key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}

export async function action({
  params,
  request,
  context: { userId },
}: Route.ActionArgs) {
  if (!userId) return redirect("/settings");
  const form = await request.formData();
  const mood = form.get("mood");
  const year = form.get("year");

  if (typeof mood !== "string" || typeof year !== "string") return null;

  await getTracksFromMood(mood, year, userId);
}
