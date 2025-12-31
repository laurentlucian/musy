import { Suspense } from "react";
import { redirect } from "react-router";
import { Waver } from "~/components/icons/waver";
import { userContext } from "~/context";
import { getTopData } from "~/routes/profile/utils/profile.server";
import { TopList, TopSelector } from "~/routes/profile/utils/profile.utils";
import type { Route } from "./+types/profile.index";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);

  if (!userId) throw redirect("/");

  const url = new URL(request.url);
  const year = +(url.searchParams.get("year") ?? "2025");
  const range = url.searchParams.get("range") ?? "long_term";
  const type = url.searchParams.get("type") ?? "tracks";

  return {
    userId,
    year,
    range,
    type,
    topData: getTopData({ userId, range, type }),
  };
}

export default function ProfileIndex({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <TopSelector type={loaderData.type} range={loaderData.range} />
      <Suspense fallback={<Waver />}>
        <TopList promise={loaderData.topData} type={loaderData.type} />
      </Suspense>
    </>
  );
}
