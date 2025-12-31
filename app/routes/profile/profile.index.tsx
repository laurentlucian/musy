import { Suspense, use } from "react";
import { redirect } from "react-router";
import { Waver } from "~/components/icons/waver";
import { NumberAnimated } from "~/components/ui/number-animated";
import { userContext } from "~/context";
import { getStats } from "~/lib/services/db/users.server";
import { Selector } from "~/routes/profile/utils/profile.utils";
import type { Route } from "./+types/profile.index";

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

export default function ProfileIndex({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Selector year={loaderData.year} />
      </div>
      <Suspense fallback={<Waver />}>
        <Stats promise={loaderData.stats} year={loaderData.year} />
      </Suspense>
    </>
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
