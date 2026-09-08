import { resolveProfileId } from "~/lib.server/services/usernames";
import { Link, redirect } from "react-router";
import { userContext } from "~/context";
import { getProfileGenres } from "~/lib.server/services/profile-genres";
import type { Route } from "./+types/genres";

export async function loader({ params, context }: Route.LoaderArgs) {
  const userId = await resolveProfileId(
    params.userId,
    context.get(userContext),
  );
  if (!userId) throw redirect("/");
  return { userId, ...(await getProfileGenres(userId)) };
}

export default function ProfileGenres({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4 pb-4">
      <div>
        <h1 className="font-semibold text-xl">Top genres</h1>
        <p className="text-muted-foreground text-xs">
          Spotify top artists · 4-week snapshot
        </p>
        {loaderData.updatedAt && (
          <p className="text-muted-foreground text-xs">
            Saved{" "}
            {new Date(loaderData.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </p>
        )}
      </div>
      {loaderData.genres.length ? (
        <div className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <p className="mb-4 text-muted-foreground text-xs">
            Ranked by artist count. Artists can have multiple genres.
          </p>
          <ol className="flex flex-col gap-3">
            {loaderData.genres.map(({ name, count }, index) => (
              <li key={name} className="flex items-center gap-3 text-sm">
                <span className="w-6 text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 capitalize">{name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {count} {count === 1 ? "artist" : "artists"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No genre data yet.</p>
      )}
      <Link
        to={`/profile/${encodeURIComponent(loaderData.userId)}/repeating?type=artists&range=short_term`}
        className="text-muted-foreground text-sm underline underline-offset-4 hover:text-foreground"
      >
        View top artists
      </Link>
    </div>
  );
}
