import { resolveProfileId } from "~/lib.server/services/usernames";
import { data, Outlet, redirect } from "react-router";
import { userContext } from "~/context";
import { getProfile } from "~/lib.server/services/db/users";
import { syncUserPlaylists } from "~/lib.server/services/scheduler/scripts/sync/playlist";
import { syncUserProfile } from "~/lib.server/services/scheduler/scripts/sync/profile";
import { syncUserRecent } from "~/lib.server/services/scheduler/scripts/sync/recent";
import { syncUserTop } from "~/lib.server/services/scheduler/scripts/sync/top";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import type { Route } from "./+types/profile";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const userId = await resolveProfileId(
    params.userId,
    context.get(userContext),
  );
  const currentUserId = context.get(userContext);

  if (!userId) throw redirect("/");

  const profile = await getProfile(userId);
  if (!profile) throw data(null, { status: 404 });
  if (profile.username && params.userId !== profile.username) {
    const url = new URL(request.url);
    const suffix = params.userId
      ? url.pathname.slice(`/profile/${params.userId}`.length)
      : url.pathname.slice("/profile".length);
    throw redirect(`/profile/${profile.username}${suffix}${url.search}`);
  }

  return {
    userId,
    currentUserId,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const currentUserId = context.get(userContext);
  if (!currentUserId) {
    return data({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = formData.get("userId");

  if (intent !== "sync" || userId !== currentUserId) {
    return data({ success: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    const spotify = await getSpotifyClient({ userId });
    await Promise.all([
      syncUserProfile({ userId, spotify }),
      syncUserRecent({ userId, spotify }),
      syncUserTop({ userId, spotify }),
      syncUserPlaylists({ userId, spotify }),
    ]);
    return data({ success: true });
  } catch (error) {
    return data(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}

export default function Profile() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Outlet />
    </div>
  );
}
