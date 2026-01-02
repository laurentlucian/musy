import { RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { data, Link, redirect, useFetcher, useRevalidator } from "react-router";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { NumberAnimated } from "~/components/ui/number-animated";
import { userContext } from "~/context";
import { getStats } from "~/lib.server/services/db/users";
import {
  syncUserStats,
  syncUserStatsAll,
} from "~/lib.server/services/scheduler/scripts/sync/stats";
import { Selector } from "~/routes/profile/utils/profile.utils";
import type { Route } from "./+types/profile.stats";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);
  const currentUserId = context.get(userContext);

  if (!userId) throw redirect("/");

  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const currentYear = new Date().getFullYear();
  const year = yearParam === "all" ? 0 : yearParam ? +yearParam : currentYear;

  const stats = await getStats(userId, year);

  return {
    userId,
    currentUserId,
    year,
    stats,
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

  if (
    intent !== "sync-stats" ||
    !userId ||
    typeof userId !== "string" ||
    !year ||
    typeof year !== "string"
  ) {
    return data({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const yearNum = +year;
  if (yearNum === 0) {
    await syncUserStatsAll({ userId });
  } else {
    await syncUserStats({ userId, year: yearNum });
  }
  return data({ success: true });
}

export default function ProfileIndex({ loaderData }: Route.ComponentProps) {
  useStatsAutoSync(loaderData.userId, loaderData.year, loaderData.stats);

  return (
    <>
      <div className="flex items-center gap-2">
        <Selector year={loaderData.year} />
        {loaderData.currentUserId === loaderData.userId && (
          <StatsSyncButton userId={loaderData.userId} year={loaderData.year} />
        )}
      </div>
      {loaderData.stats === null ? (
        <Waver />
      ) : (
        <Stats stats={loaderData.stats} year={loaderData.year} />
      )}
    </>
  );
}

function StatsSyncButton({ userId, year }: { userId: string; year: number }) {
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const isSyncing =
    fetcher.state === "submitting" || fetcher.state === "loading";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      void revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator]);

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

function useStatsAutoSync(
  userId: string,
  year: number,
  stats: Awaited<ReturnType<typeof getStats>>,
) {
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const syncedYearRef = useRef<number | null>(null);

  useEffect(() => {
    if (syncedYearRef.current !== year) {
      syncedYearRef.current = null;
    }
  }, [year]);

  useEffect(() => {
    if (
      stats === null &&
      fetcher.state === "idle" &&
      (!fetcher.data || syncedYearRef.current !== year)
    ) {
      syncedYearRef.current = year;
      fetcher.submit(
        { intent: "sync-stats", userId, year: year.toString() },
        { method: "post" },
      );
    }
  }, [stats, fetcher, userId, year]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      syncedYearRef.current = year;
      void revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator, year]);
}

function Stats({
  stats,
  year,
}: {
  stats: NonNullable<Awaited<ReturnType<typeof getStats>>>;
  year: number;
}) {
  const [timeUnit, setTimeUnit] = useState<
    "minutes" | "days" | "weeks" | "seconds"
  >("minutes");

  const cycleTimeUnit = () => {
    setTimeUnit((prev) => {
      switch (prev) {
        case "minutes":
          return "days";
        case "days":
          return "weeks";
        case "weeks":
          return "seconds";
        case "seconds":
          return "minutes";
        default:
          return "minutes";
      }
    });
  };

  const getDisplayValue = () => {
    const minutes = stats.minutes;
    switch (timeUnit) {
      case "minutes":
        return minutes;
      case "days":
        return minutes / 1440; // 24 * 60
      case "weeks":
        return minutes / 10080; // 7 * 24 * 60
      case "seconds":
        return minutes * 60;
      default:
        return minutes;
    }
  };

  const getUnitLabel = () => {
    switch (timeUnit) {
      case "minutes":
        return "minutes listened";
      case "days":
        return "days listened";
      case "weeks":
        return "weeks listened";
      case "seconds":
        return "seconds listened";
      default:
        return "minutes listened";
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 whitespace-nowrap">
        <div className="rounded-lg bg-card p-3">
          <p className="font-bold text-3xl">
            <NumberAnimated value={stats.played} key={year} />
          </p>
          <p className="text-muted-foreground text-xs">tracks played</p>
        </div>
        <button
          type="button"
          className="cursor-pointer rounded-lg bg-card p-3 text-left"
          onClick={cycleTimeUnit}
          aria-label={`Switch time unit display, currently showing ${getUnitLabel()}`}
        >
          <p className="font-bold text-3xl">
            <NumberAnimated
              value={getDisplayValue()}
              key={`${year}-${timeUnit}`}
            />
          </p>
          <p className="text-muted-foreground text-xs">{getUnitLabel()}</p>
        </button>
        <div className="flex gap-4">
          <div className="rounded-lg bg-card p-3">
            <p className="font-bold text-3xl">
              <NumberAnimated value={stats.liked} key={year} />
            </p>
            <p className="text-muted-foreground text-xs">tracks liked</p>
          </div>
        </div>
      </div>
      {stats.song && (
        <div className="rounded-lg bg-card p-4">
          {stats.trackId ? (
            <Link
              to={`/track/${stats.trackId}`}
              viewTransition
              className="font-bold text-2xl hover:underline"
            >
              {stats.song}
            </Link>
          ) : (
            <p className="font-bold text-2xl">{stats.song}</p>
          )}
          <p className="text-muted-foreground text-sm">most listened track</p>
        </div>
      )}

      {stats.artist && (
        <div className="rounded-lg bg-card p-4">
          {stats.artistId ? (
            <Link
              to={`/artist/${stats.artistId}`}
              viewTransition
              className="font-bold text-2xl hover:underline"
            >
              {stats.artist}
            </Link>
          ) : (
            <p className="font-bold text-2xl">{stats.artist}</p>
          )}
          <p className="text-muted-foreground text-sm">most listened artist</p>
        </div>
      )}

      {stats.album && (
        <div className="rounded-lg bg-card p-4">
          {stats.albumId ? (
            <Link
              to={`/album/${stats.albumId}`}
              viewTransition
              className="font-bold text-2xl hover:underline"
            >
              {stats.album}
            </Link>
          ) : (
            <p className="font-bold text-2xl">{stats.album}</p>
          )}
          <p className="text-muted-foreground text-sm">most listened album</p>
        </div>
      )}
    </>
  );
}
