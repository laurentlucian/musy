import { env } from "cloudflare:workers";
import { renderBadge } from "~/lib/badge";
import { getDashboard } from "~/lib.server/services/dashboard";
import { getProfileGenres } from "~/lib.server/services/profile-genres";
import { resolveProfileId } from "~/lib.server/services/usernames";
import type { Route } from "./+types/badge";

const labels: Record<string, string> = {
  "hours.svg": "Hours listened",
  "genres.svg": "Top genres",
  "repeat.svg": "On repeat",
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const label = labels[params.badge];
  if (!Object.hasOwn(labels, params.badge))
    throw new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  const users = new URL(request.url).searchParams.getAll("user");
  const user = users[0]?.trim();
  if (users.length !== 1 || !user || users[0].length > 128)
    throw new Response("Provide one user ID or username", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  let value = "No listening yet";
  let detail = "Listen with Musy";
  let status = 200;
  try {
    const userId = await resolveProfileId(user, null);
    if (!userId) throw new Error("Profile resolution returned no user");
    if (params.badge === "hours.svg") {
      const stats = await getDashboard(userId, 0);
      value = `${stats.estimatedPlays || stats.unknownPlays ? "~" : ""}${Math.round(stats.minutes / 60).toLocaleString("en-US")} hours`;
      detail = stats.pending
        ? "All-time recorded listening · Updating"
        : "All-time recorded listening";
      if (!stats.played && stats.pending) value = "Updating";
    } else if (params.badge === "genres.svg") {
      const { genres, updatedAt } = await getProfileGenres(userId);
      if (genres.length) {
        value = genres
          .slice(0, 2)
          .map((genre) => genre.name)
          .join(" · ");
        detail = `${genres[2] ? `${genres[2].name} · ` : ""}4-week top artists · ${updatedAt?.slice(0, 10) ?? ""}`;
      } else {
        value = "No genres yet";
        detail = "Genres from 4-week top artists";
      }
    } else {
      const snapshot = await env.D1.prepare(
        "SELECT trackIds, createdAt FROM TopTracks WHERE userId=? AND type='short_term' ORDER BY createdAt DESC LIMIT 1",
      )
        .bind(userId)
        .first<{ trackIds: string; createdAt: string }>();
      const track = snapshot?.trackIds.split(",")[0];
      const song = track
        ? await env.D1.prepare(
            "SELECT t.name, (SELECT group_concat(a.name, ', ') FROM _TrackToArtist ta JOIN Artist a ON a.id=ta.artistId WHERE ta.trackId=t.id) AS artists FROM Track t WHERE t.id=?",
          )
            .bind(track)
            .first<{ name: string; artists: string | null }>()
        : null;
      if (song && snapshot) {
        value = song.name;
        detail = `${song.artists ?? "Top track"} · ${snapshot.createdAt.slice(0, 10)}`;
      } else {
        value = "No repeat yet";
        detail = "Your top track over 4 weeks";
      }
    }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "init" in error &&
      error.init &&
      typeof error.init === "object" &&
      "status" in error.init &&
      error.init.status === 404
    ) {
      throw new Response("User not found", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }
    console.error("Badge unavailable", params.badge, error);
    value = "Unavailable";
    detail = "Try again soon";
    status = 503;
  }
  return new Response(renderBadge(label, value, detail), {
    status,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control":
        status === 200 ? "public, max-age=300, s-maxage=300" : "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
