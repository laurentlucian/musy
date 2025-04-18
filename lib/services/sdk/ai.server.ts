import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function askAI(prompt: string) {
  const completion = await generateText({
    model: openai("o4-mini"),
    prompt,
    headers: {
      "x-api-key": process.env.OPENAI_API_KEY,
    },
  });

  return completion.text;
}
