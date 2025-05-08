import { getTracksFromMood } from "@lib/services/sdk/helpers/ai.server";
import { getYear } from "date-fns";
import { useState } from "react";
import { href, redirect, useFetcher } from "react-router";
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
  "work",
  "relax",
] as const;

const years = Array.from(
  { length: getYear(new Date()) - 2020 + 1 },
  (_, i) => 2020 + i,
);

// const genres = [
//   "acoustic",
//   "electronic",
//   "rock",
//   "pop",
//   "hip-hop",
//   "any",
// ];

export default function Mood(_: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>();
  const [mood, setMood] = useState("");
  const [year, setYear] = useState("");

  const generating = fetcher.state !== "idle";
  return (
    <fetcher.Form
      key={mood}
      method="post"
      className="flex w-full max-w-sm flex-col gap-4 px-12 py-6"
    >
      <Input type="hidden" name="mood" value={mood} />
      <Input type="hidden" name="year" value={year} />
      {mood && (
        <Button type="button" variant="outline" size="lg" disabled>
          {mood}
        </Button>
      )}
      {year && (
        <Button type="button" variant="outline" size="lg" disabled>
          {year}
        </Button>
      )}

      {!mood &&
        moods.map((mood) => (
          <Button
            type="button"
            variant="outline"
            size="lg"
            key={mood}
            onClick={() => setMood(mood)}
          >
            {mood}
          </Button>
        ))}

      {mood &&
        !year &&
        years.map((year) => (
          <Button
            type="button"
            variant="outline"
            size="lg"
            key={year}
            onClick={() => setYear(year.toString())}
          >
            {year}
          </Button>
        ))}

      {mood && year && (
        <Button type="submit" size="lg" disabled={generating}>
          {generating ? <Waver /> : "Generate"}
        </Button>
      )}
    </fetcher.Form>
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
