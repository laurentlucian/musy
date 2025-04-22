import { xai } from "@ai-sdk/xai";
import { generateObject, jsonSchema } from "ai";

export const tasteSchema = jsonSchema<{
  primary_genres: string[];
  secondary_genres: string[];
  dominant_moods: string[];
  sonic_characteristics: {
    tempo_preference: string;
    production_style: string;
    vocal_preference: string;
    instrumental_elements: string[];
  };
  era_preference: string[];
  listening_patterns: {
    diversity: string;
    consistency: string;
    experimental_tendency: string;
  };
  notable_influences: {
    artists: string[];
    scenes: string[];
  };
}>({
  type: "object",
  properties: {
    primary_genres: {
      type: "array",
      items: { type: "string" },
    },
    secondary_genres: {
      type: "array",
      items: { type: "string" },
    },
    dominant_moods: {
      type: "array",
      items: { type: "string" },
    },
    sonic_characteristics: {
      type: "object",
      properties: {
        tempo_preference: { type: "string" },
        production_style: { type: "string" },
        vocal_preference: { type: "string" },
        instrumental_elements: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "tempo_preference",
        "production_style",
        "vocal_preference",
        "instrumental_elements",
      ],
    },
    era_preference: {
      type: "array",
      items: { type: "string" },
    },
    listening_patterns: {
      type: "object",
      properties: {
        diversity: { type: "string" },
        consistency: { type: "string" },
        experimental_tendency: { type: "string" },
      },
      required: ["diversity", "consistency", "experimental_tendency"],
    },
    notable_influences: {
      type: "object",
      properties: {
        artists: {
          type: "array",
          items: { type: "string" },
        },
        scenes: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["artists", "scenes"],
    },
  },
  required: [
    "primary_genres",
    "secondary_genres",
    "dominant_moods",
    "sonic_characteristics",
    "era_preference",
    "listening_patterns",
    "notable_influences",
  ],
});

export async function askAITaste(prompt: string) {
  const completion = await generateObject({
    model: xai("grok-3-mini-latest"),
    prompt,
    schema: tasteSchema,
    headers: {
      "x-api-key": process.env.XAI_API_KEY,
    },
  });

  return completion.object;
}
