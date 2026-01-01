import { Suspense, use } from "react";
import { data, Outlet, redirect } from "react-router";
import { Waver } from "~/components/icons/waver";
import { Image } from "~/components/ui/image";
import { userContext } from "~/context";
import { getProfile } from "~/lib/services/db/users.server";
import { syncUserPlaylists } from "~/lib/services/scheduler/scripts/sync/playlist.server";
import { syncUserProfile } from "~/lib/services/scheduler/scripts/sync/profile.server";
import { syncUserRecent } from "~/lib/services/scheduler/scripts/sync/recent.server";
import { syncUserTop } from "~/lib/services/scheduler/scripts/sync/top.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";
import {
  Links,
  Loader,
  SyncButton,
} from "~/routes/profile/utils/profile.utils";
import type { Route } from "./+types/profile";

export async function loader({ params, context }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);
  const currentUserId = context.get(userContext);

  if (!userId) throw redirect("/");

  return {
    userId,
    currentUserId,
    profile: getProfile(userId),
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

export default function Profile({ loaderData }: Route.ComponentProps) {
  return (
    <article className="flex flex-1 flex-col gap-6 self-stretch px-6 py-2">
      <Suspense
        fallback={
          <div className="mx-auto py-10">
            <Waver />
          </div>
        }
      >
        <Avatar
          promise={loaderData.profile}
          userId={loaderData.userId}
          currentUserId={loaderData.currentUserId}
        />
      </Suspense>
      <Links />
      <div className="flex flex-1 flex-col gap-2">
        <Outlet />
      </div>
    </article>
  );
}

function Avatar({
  promise,
  userId,
  currentUserId,
}: {
  promise: ReturnType<typeof getProfile>;
  userId: string;
  currentUserId: string | null;
}) {
  const data = use(promise);

  if (!data) return null;

  const isOwnProfile = currentUserId === userId;

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card p-4">
      <div className="flex items-center gap-2">
        {data.image && (
          <Image
            className="rounded-full"
            height={40}
            width={40}
            src={data.image}
            alt={data.name ?? "user"}
            name={data.name}
          />
        )}
        <div className="flex w-full items-center gap-2">
          <h1 className="font-bold text-2xl">{data.name}</h1>
          <Loader />
          {isOwnProfile && <SyncButton userId={userId} />}
        </div>
      </div>
    </div>
  );
}
