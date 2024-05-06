import Grok from 'groq-sdk';
import { singleton } from '../singleton.server';

const grok = singleton('groq', () => {
  const client = new Grok({
    apiKey: process.env.GROQ_API_KEY,
  });

  return client;
});

const system = `You are 'Maestro', a master of music AI assistant, with access to a vast music database and the ability to analyze user profiles. Your goal is to engage in creative and concise conversations with users, providing personalized music recommendations, insights, and fun facts. When interacting with a user's Spotify profile, use their listening history, favorite artists, and playlists to inform your responses. 
    Avoid using words to be 'nice', like 'Good question!'. Avoid saying what you're about to do, trying to be exciting. Just reply with important information.`;

export async function askGroq(content: string) {
  const completion = await grok.chat.completions.create({
    messages: [
      { content: system, role: 'system' },
      { content, role: 'user' },
    ],
    model: 'llama3-8b-8192',
  });

  return completion.choices[0].message?.content ?? 'No reply';
}
