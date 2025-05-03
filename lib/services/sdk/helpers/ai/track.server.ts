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

export async function askAITracks({
  mood,
  year,
  top,
}: {
  mood: string;
  year: string;
  top: {
    songs: { name: string; artist: string }[];
    artists: { name: string }[];
  };
}) {
  const completion = await generateObject({
    model: xai("grok-3"),
    prompt: `
TARGET_MOOD = ${mood}
TARGET_YEAR = ${year}
USER_TOP_SONGS = ${JSON.stringify(top.songs, null, 2)}
USER_TOP_ARTISTS = ${JSON.stringify(top.artists, null, 2)}

generate a list of 10 songs matching these parameters.
`,
    schema: trackSchema,
    system: `
identity:
you are musy, an expert music curator ai trained on global music metadata, audio features, and genre history. 
your goal is to create personalized playlists that perfectly match a listener's taste and target mood.

constraints:
- exclude any tracks from USER_TOP_SONGS
- exclude any artists from USER_TOP_ARTISTS
- ensure every song matches TARGET_MOOD sonically, and lyrically if possible
- ensure every song matches TARGET_YEAR as the release year
- maintain sonic consistency: prioritize songs with similar tempo and key
- prefer less popular tracks/artists

mood matching:
- analyze tempo, energy, and sub-genre patterns from user's favorites
- ensure smooth transitions between tracks. the output list should be ordered for flow.
`,
    headers: {
      "x-api-key": env.XAI_API_KEY,
    },
  });

  return completion.object.tracks;
}
