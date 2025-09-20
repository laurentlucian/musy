import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function askAI(prompt: string) {
  const completion = await generateText({
    model: groq("llama3-8b-8192"),
    prompt,
  });
  return completion.text;
}
