import { createEnv } from "@t3-oss/env-core";
import { fly } from "@t3-oss/env-core/presets-valibot";
import * as v from "valibot";

const string = v.pipe(v.string(), v.minLength(1));

export const env = createEnv({
  server: {
    NODE_ENV: v.union([v.literal("development"), v.literal("production")]),

    DATABASE_URL: string,
    SESSION_SECRET: string,

    SPOTIFY_CLIENT_ID: string,
    SPOTIFY_CLIENT_SECRET: string,
    SPOTIFY_CALLBACK_URL: string,

    GOOGLE_CLIENT_ID: string,
    GOOGLE_CLIENT_SECRET: string,
    GOOGLE_CALLBACK_URL: string,

    DISCORD_BOT_TOKEN: v.optional(string),

    OPENAI_API_KEY: string,
    GROQ_API_KEY: string,
    XAI_API_KEY: string,
  },
  extends: [fly()],
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
