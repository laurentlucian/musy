import { RefreshCcw } from "lucide-react";
import { Suspense } from "react";
import { data, redirect, useFetcher } from "react-router";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { syncUserTop } from "~/lib.server/services/scheduler/scripts/sync/top";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import { getTopData } from "~/routes/profile/utils/profile.server";
import { TopList, TopSelector } from "~/routes/profile/utils/profile.utils";
import type { Route } from "./+types/profile.top";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);
  const currentUserId = context.get(userContext);

  if (!userId) throw redirect("/");

  const url = new URL(request.url);
  const range = url.searchParams.get("range") ?? "long_term";
  const type = url.searchParams.get("type") ?? "tracks";

  return {
    userId,
    currentUserId,
    range,
    type,
    topData: getTopData({ userId, range, type }),
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

  if (intent !== "sync-top" || userId !== currentUserId) {
    return data({ success: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    const spotify = await getSpotifyClient({ userId });
    await syncUserTop({ userId, spotify });
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

export default function ProfileTop({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <TopSelector type={loaderData.type} range={loaderData.range} />
        {loaderData.currentUserId === loaderData.userId && (
          <TopSyncButton userId={loaderData.userId} />
        )}
      </div>
      <Suspense fallback={<Waver />}>
        <TopList promise={loaderData.topData} type={loaderData.type} />
      </Suspense>
    </>
  );
}

function TopSyncButton({ userId }: { userId: string }) {
  const fetcher = useFetcher();
  const isSyncing =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isSyncing}
      onClick={() => {
        fetcher.submit({ intent: "sync-top", userId }, { method: "post" });
      }}
    >
      {isSyncing ? <Waver /> : <RefreshCcw />}
    </Button>
  );
}
