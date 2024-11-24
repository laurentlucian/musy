import OpenAI from "openai";
import { singleton } from "../singleton.server";

const openai = singleton("openai", () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
});

export async function askGPT(content: string) {
  const completion = await openai.chat.completions.create({
    messages: [{ content, role: "user" }],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message?.content ?? "No reply";
}
