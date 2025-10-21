import { xai } from "@ai-sdk/xai";
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
  familiar,
  popular,
}: {
  mood: string;
  year: string;
  popular: boolean | null;
  familiar: boolean | null;
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
<identity>
You are a highly advanced music curator AI. Your job is to generate deeply personalized playlists based on a user's listening data and their selected mood. You must use deep music understanding, emotional sensitivity, and advanced personalization logic to make each playlist feel handcrafted and meaningful.
</identity>

<constraints>
${familiar ? "exclude any tracks from USER_TOP_SONGS" : ""}
${familiar ? "exclude any artists from USER_TOP_ARTISTS" : ""}
ensure every song matches TARGET_MOOD
ensure every song matches TARGET_YEAR as the release year
maintain sonic consistency: prioritize songs with similar tempo and key
${popular ? "prefer less popular tracks/artists" : ""}
</constraints>

<mood matching>
analyze tempo, energy, and sub-genre patterns from user's favorites
ensure smooth transitions between tracks. the output list should be ordered for flow
keep the playlist emotionally consistent
no song should break the vibe
you may introduce new genres or artists, but only if they are similar in sound and feeling to what the user already listens to
be thoughtful, precise, and emotionally aware in every selection
</mood matching>
`,
    headers: {
      "x-api-key": process.env.XAI_API_KEY,
    },
  });

  return completion.object.tracks;
}
