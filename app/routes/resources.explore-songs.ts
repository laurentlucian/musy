import { data, redirect } from "react-router";
import { userContext } from "~/context";
import { normalizeCountry } from "~/lib/countries";
import {
  getLocationSongs,
  parseHistoryCursor,
} from "~/lib.server/services/history-insights";
import type { Route } from "./+types/resources.explore-songs";

export async function loader({ request, context }: Route.LoaderArgs) {
  const headers = { "Cache-Control": "private, no-store" };
  const userId = context.get(userContext);
  if (!userId) throw redirect("/", { headers });
  const params = new URL(request.url).searchParams;
  const country = normalizeCountry(params.get("country"));
  if (params.has("country") && !country)
    throw data("Invalid country", { status: 400, headers });
  let cursor: ReturnType<typeof parseHistoryCursor>;
  try {
    cursor = parseHistoryCursor(params.get("cursor"));
  } catch {
    throw data("Invalid cursor", { status: 400, headers });
  }
  return data(
    {
      query: params.toString(),
      songs: await getLocationSongs(
        userId,
        cursor,
        country,
        params.get("direction") === "previous",
      ),
    },
    { headers },
  );
}
