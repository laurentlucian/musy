import { Suspense, use } from "react";
import { data, redirect } from "react-router";
import { RefreshCcw } from "lucide-react";
import { useFetcher } from "react-router";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { NumberAnimated } from "~/components/ui/number-animated";
import { userContext } from "~/context";
import { getStats } from "~/lib/services/db/users.server";
import { syncUserStats } from "~/lib/services/scheduler/scripts/sync/stats.server";
import { Selector } from "~/routes/profile/utils/profile.utils";
import type { Route } from "./+types/profile.stats";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);

  if (!userId) throw redirect("/");

  const url = new URL(request.url);
  const year = +(url.searchParams.get("year") ?? "2025");

  return {
    userId,
    year,
    stats: getStats(userId, year),
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
  const year = formData.get("year");

  if (intent !== "sync-stats" || userId !== currentUserId || !year) {
    return data({ success: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    await syncUserStats({ userId, year: +year });
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

export default function ProfileIndex({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Selector year={loaderData.year} />
        <StatsSyncButton userId={loaderData.userId} year={loaderData.year} />
      </div>
      <Suspense fallback={<Waver />}>
        <Stats promise={loaderData.stats} year={loaderData.year} />
      </Suspense>
    </>
  );
}

function StatsSyncButton({
  userId,
  year,
}: {
  userId: string;
  year: number;
}) {
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
        fetcher.submit(
          { intent: "sync-stats", userId, year: year.toString() },
          { method: "post" },
        );
      }}
    >
      {isSyncing ? <Waver /> : <RefreshCcw />}
    </Button>
  );
}

function Stats({
  promise,
  year,
}: {
  promise: ReturnType<typeof getStats>;
  year: number;
}) {
  const data = use(promise);

  return (
    <>
      <div className="flex flex-wrap gap-4 whitespace-nowrap max-sm:justify-between">
        <div className="rounded-lg bg-card p-3">
          <p className="font-bold text-3xl">
            <NumberAnimated value={data.played} key={year} />
          </p>
          <p className="text-muted-foreground text-xs">tracks played</p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-lg bg-card p-3">
            <p className="font-bold text-3xl">
              <NumberAnimated value={data.liked} key={year} />
            </p>
            <p className="text-muted-foreground text-xs">tracks liked</p>
          </div>
        </div>
        <div className="rounded-lg bg-card p-3">
          <p className="font-bold text-3xl">
            <NumberAnimated value={data.minutes} key={year} />
          </p>
          <p className="text-muted-foreground text-xs">minutes listened</p>
        </div>
      </div>
      {data.song && (
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-2xl">{data.song}</p>
          <p className="text-muted-foreground text-sm">most listened track</p>
        </div>
      )}

      {data.artist && (
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-2xl">{data.artist}</p>
          <p className="text-muted-foreground text-sm">most listened artist</p>
        </div>
      )}

      {data.album && (
        <div className="rounded-lg bg-card p-4">
          <p className="font-bold text-2xl">{data.album}</p>
          <p className="text-muted-foreground text-sm">most listened album</p>
        </div>
      )}
    </>
  );
}
