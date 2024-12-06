import { sendDiscordEmbed } from "@lib/services/sdk/discord.server";
import { log } from "@lib/utils";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { getClientLocales } from "remix-utils/locales/server";
import type { Route } from "./+types/404";

export function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  log(`${pathname}`, "404");
  const ip = getClientIPAddress(request);
  const locales = getClientLocales(request);
  void sendDiscordEmbed({
    embed: {
      title: "404",
      description: `**path** ${pathname}`,
      color: 0x0000ff,
      fields: [
        {
          name: "user",
          value: context.userId || "unknown",
        },
        {
          name: "ip",
          value: ip || "unknown",
        },
        {
          name: "locale",
          value: locales?.join(", ") || "unknown",
        },
      ],
    },
  });
}

export default function NotFound() {
  return (
    <main className="container mx-auto p-4 pt-16 text-center">
      <h1>404</h1>
      <p>page not found</p>
    </main>
  );
}
