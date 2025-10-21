import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";

export async function askAITaste(prompt: string) {
  const completion = await generateText({
    model: xai("grok-3-mini-latest"),
    prompt,
    system: `
    respond with XML format, as the following:
    
    <music_preferences>
      <primary_genres type="array" length="5">
        string
      </primary_genres>
      <secondary_genres type="array" length="5">
        string
      </secondary_genres>

      <dominant_moods type="array" length="5">
        string
      </dominant_moods>

      <sonic_characteristics>
        <tempo_preference>string</tempo_preference>
        <production_style>string</production_style>
        <vocal_preference>string</vocal_preference>
        <instrumental_elements type="array" length="5">
          strings
        </instrumental_elements>
      </sonic_characteristics>

      <listening_patterns>
        <diversity>string</diversity>
        <consistency>string</consistency>
        <experimental_tendency>string</experimental_tendency>
      </listening_patterns>
    </music_preferences>`,
    headers: {
      "x-api-key": process.env.XAI_API_KEY,
    },
  });

  return completion.text;
}
