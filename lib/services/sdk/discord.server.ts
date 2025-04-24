import { env } from "@lib/env.server";
import { type APIEmbed, type APIMessage, REST, Routes } from "discord.js";

const token = env.DISCORD_BOT_TOKEN;
const discord = token ? new REST({ version: "10" }).setToken(token) : null;

const CHANNEL = "1314314082232303656";

export async function sendDiscordEmbed({
  embed,
  thread,
}: {
  embed: APIEmbed;
  thread?: {
    name: string;
    messages: string[];
  };
}) {
  if (!discord) return;

  try {
    const message = (await discord.post(Routes.channelMessages(CHANNEL), {
      body: {
        embeds: [embed],
      },
    })) as APIMessage;

    if (thread) await createThread(message.id, thread);
  } catch (error) {
    console.error("Failure sending Discord embed:", error);
  }
}

async function createThread(
  messageId: string,
  thread: {
    name: string;
    messages: string[];
  },
) {
  if (!discord) return;

  const response = (await discord.post(Routes.threads(CHANNEL, messageId), {
    body: {
      name: thread.name,
    },
  })) as APIMessage;

  for (const content of thread.messages) {
    await discord.post(Routes.channelMessages(response.id), {
      body: {
        content,
      },
    });
  }
}
