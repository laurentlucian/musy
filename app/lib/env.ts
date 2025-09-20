import { createEnv } from "@t3-oss/env-core";
import * as v from "valibot";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  client: {
    PUBLIC_POSTHOG_KEY: v.string(),
  },
  isServer: typeof window === "undefined",
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
