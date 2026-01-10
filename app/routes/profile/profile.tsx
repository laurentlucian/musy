import { Suspense } from "react";
import { data, Outlet, redirect } from "react-router";
import { Waver } from "~/components/icons/waver";
import { Image } from "~/components/ui/image";
import { userContext } from "~/context";
import { getProfile } from "~/lib.server/services/db/users";
import { syncUserPlaylists } from "~/lib.server/services/scheduler/scripts/sync/playlist";
import { syncUserProfile } from "~/lib.server/services/scheduler/scripts/sync/profile";
import { syncUserRecent } from "~/lib.server/services/scheduler/scripts/sync/recent";
import { syncUserTop } from "~/lib.server/services/scheduler/scripts/sync/top";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
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

  const profile = await getProfile(userId);

  if (!profile) throw data(null, { status: 404 });

  return {
    userId,
    currentUserId,
    profile,
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
          data={loaderData.profile}
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
  data,
  userId,
  currentUserId,
}: {
  data: Awaited<ReturnType<typeof getProfile>>;
  userId: string;
  currentUserId: string | null;
}) {
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
