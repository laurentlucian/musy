import { xai } from "@ai-sdk/xai";
import { env } from "@lib/env.server";
import { generateObject, jsonSchema } from "ai";

const trackSchema = jsonSchema<{
  tracks: {
    name: string;
    artist: string;
    year: number;
  }[];
}>({
  type: "object",
  properties: {
    tracks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          artist: { type: "string" },
          year: { type: "number" },
        },
        required: ["name", "artist", "year"],
      },
    },
  },
  required: ["tracks"],
});

export async function askAITracks(prompt: string) {
  const completion = await generateObject({
    model: xai("grok-3-mini-latest"),
    prompt,
    schema: trackSchema,
    headers: {
      "x-api-key": env.XAI_API_KEY,
    },
  });

  return completion.object.tracks;
}
