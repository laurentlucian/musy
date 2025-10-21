import { defineNitroPlugin } from "nitropack/runtime/plugin";

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("cloudflare:scheduled", async ({ controller, env, context }) => {
    // Import the handler dynamically to avoid bundling issues
    const { default: handleScheduled } = await import("~/lib/services/scheduler/scheduled.server");
    await handleScheduled({ controller, env, context });
  });
});
