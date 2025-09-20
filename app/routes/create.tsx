import { useMachine } from "@xstate/react";
import { getYear } from "date-fns";
import { href, redirect, useFetcher } from "react-router";
import { assign, setup } from "xstate";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { generatePlaylist } from "~/lib/services/sdk/helpers/ai.server";
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

const familiar = ["familiar", "fresh"];

const popular = ["popular", "unknown"];

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
  const [{ value, context }, send] = useMachine(machine);

  const generating = fetcher.state !== "idle";
  return (
    <fetcher.Form
      method="post"
      className="flex w-full max-w-sm flex-col gap-4 px-12 py-6"
    >
      <Input type="hidden" name="mood" value={context.mood} />
      <Input type="hidden" name="year" value={context.year} />
      {context.mood && (
        <Button type="button" variant="outline" size="lg" disabled>
          {context.mood}
        </Button>
      )}
      {context.year && (
        <Button type="button" variant="outline" size="lg" disabled>
          {context.year}
        </Button>
      )}
      {context.familiar && (
        <>
          <Input
            type="hidden"
            name="familiar"
            value={context.familiar === "familiar" ? "true" : "false"}
          />
          <Button type="button" variant="outline" size="lg" disabled>
            {context.familiar}
          </Button>
        </>
      )}
      {context.popular && (
        <>
          <Input
            type="hidden"
            name="popular"
            value={context.popular === "popular" ? "true" : "false"}
          />
          <Button type="button" variant="outline" size="lg" disabled>
            {context.popular}
          </Button>
        </>
      )}

      {value === "idle" &&
        moods.map((mood) => (
          <Button
            type="button"
            variant="outline"
            size="lg"
            key={mood}
            onClick={() => send({ type: "input", data: mood })}
          >
            {mood}
          </Button>
        ))}

      {value === "year" &&
        years.map((year) => (
          <Button
            type="button"
            variant="outline"
            size="lg"
            key={year}
            onClick={() => send({ type: "input", data: year.toString() })}
          >
            {year}
          </Button>
        ))}

      {value === "familiar" &&
        familiar.map((familiar) => (
          <Button
            type="button"
            variant="outline"
            size="lg"
            key={familiar}
            onClick={() =>
              send({
                type: "input",
                data: familiar,
              })
            }
          >
            {familiar}
          </Button>
        ))}

      {value === "popular" &&
        popular.map((popular) => (
          <Button
            type="button"
            variant="outline"
            size="lg"
            key={popular}
            onClick={() =>
              send({
                type: "input",
                data: popular,
              })
            }
          >
            {popular}
          </Button>
        ))}

      {value === "generate" && (
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

  let familiarEntry = form.get("familiar");
  let popularEntry = form.get("popular");
  let familiar: boolean | null = null;
  let popular: boolean | null = null;

  if (typeof familiarEntry === "string") familiar = familiarEntry === "true";
  if (typeof popularEntry === "string") popular = popularEntry === "true";

  const id = await generatePlaylist({ mood, year, familiar, popular }, userId);
  return redirect(href("/playlists/:id", { id }));
}

type Context = {
  mood?: string;
  year?: string;
  familiar?: string;
  popular?: string;
};

const machine = setup({
  types: {
    context: {} as Context,
    events: {} as { type: "input"; data: string },
  },
}).createMachine({
  initial: "idle",
  states: {
    idle: {
      on: {
        input: {
          target: "year",
          actions: assign({ mood: ({ event }) => event.data }),
        },
      },
    },
    year: {
      on: {
        input: {
          target: "familiar",
          actions: assign({ year: ({ event }) => event.data }),
        },
      },
    },
    familiar: {
      on: {
        input: {
          target: "popular",
          actions: assign({ familiar: ({ event }) => event.data }),
        },
      },
    },
    popular: {
      on: {
        input: {
          target: "generate",
          actions: assign({ popular: ({ event }) => event.data }),
        },
      },
    },
    generate: {
      type: "final",
    },
  },
});
