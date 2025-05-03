import { prisma } from "@lib/services/db.server";
import { getTracksFromMood } from "@lib/services/sdk/helpers/ai.server";
import { useState } from "react";
import { href, Link, redirect, useFetcher } from "react-router";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Route } from "./+types/create";

const moods = [
  "happy",
  "chill",
  "energetic",
  "focus",
  "sad",
  "romantic",
  "upbeat",
  "sleep",
] as const;
const years = Array.from(
  { length: new Date().getFullYear() - 2020 },
  (_, i) => 2020 + i,
);

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

export default function Mood({
  loaderData: { playlists },
}: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>();
  const [mood, setMood] = useState("");
  const [year, setYear] = useState("");

  const generating = fetcher.state !== "idle";
  return (
    <div className="flex w-full flex-col items-center gap-6 px-12 py-6">
      <fetcher.Form key={mood} method="post">
        <Input type="hidden" name="mood" value={mood} />
        <Input type="hidden" name="year" value={year} />

        <div className="flex flex-wrap justify-center gap-3">
          {!mood &&
            moods.map((mood) => (
              <Button type="button" key={mood} onClick={() => setMood(mood)}>
                {mood}
              </Button>
            ))}

          {mood &&
            !year &&
            years.map((year) => (
              <Button
                type="button"
                key={year}
                onClick={() => setYear(year.toString())}
              >
                {year}
              </Button>
            ))}

          {mood && year && (
            <Button type="submit" disabled={generating}>
              {generating ? (
                <>
                  Generating <Waver />
                </>
              ) : (
                "Generate"
              )}
            </Button>
          )}
        </div>
      </fetcher.Form>

      <div className="flex w-full flex-col items-center gap-2">
        {playlists.map((playlist) => (
          <Link
            key={playlist.id}
            to={href("/generated/:id", {
              id: playlist.id,
            })}
            className="flex w-full max-w-sm flex-col rounded-lg bg-card p-4 hover:bg-card/80"
          >
            <p>
              {playlist.mood} {playlist.year}
            </p>
            <p className="text-muted-foreground text-sm">
              by {playlist.owner.user.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function action({
  request,
  context: { userId },
}: Route.ActionArgs) {
  if (!userId) return redirect("/settings");

  const form = await request.formData();
  const mood = form.get("mood");

  if (typeof mood !== "string") return null;
  const year = form.get("year");

  if (typeof year !== "string") return null;

  const id = await getTracksFromMood(mood, year, userId);
  return redirect(href("/generated/:id", { id }));
}
