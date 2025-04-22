import { getTracksFromMood } from "@lib/services/sdk/helpers/ai.server";
import { useFetcher } from "react-router";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Route } from "./+types/create";

const examples = ["happy", "chill", "energetic", "focus", "sad"] as const;

export default function Mood() {
  const fetcher = useFetcher<typeof action>();

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <fetcher.Form method="post">
        <Input name="mood" type="text" placeholder="how are you feeling?" />
      </fetcher.Form>

      <div className="flex flex-wrap justify-center gap-3">
        {examples.map((mood) => (
          <fetcher.Form key={mood} method="post">
            <Input type="hidden" name="mood" value={mood} />
            <Button type="submit">{mood}</Button>
          </fetcher.Form>
        ))}
      </div>
      {fetcher.state !== "idle" && <Waver />}
      {fetcher.data?.tracks && (
        <div className="flex w-full max-w-md flex-col gap-2">
          {fetcher.data.tracks.map((track) => (
            <Track key={track.id} {...track} />
          ))}
        </div>
      )}
    </div>
  );
}

export async function action({
  request,
  context: { userId },
}: Route.ActionArgs) {
  const form = await request.formData();
  const mood = form.get("mood");

  if (typeof mood !== "string") return null;

  const tracks = await getTracksFromMood(mood, userId);

  return {
    tracks,
  };
}
