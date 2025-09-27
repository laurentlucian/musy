import { Suspense, use } from "react";
import { redirect } from "react-router";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { userContext } from "~/context";
import {
  getUserRecent,
  type UserRecent,
} from "~/lib/services/db/tracks.server";
import type { Route } from "./+types/profile.recent";

export async function loader({ context, params }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);
  if (!userId) throw redirect("/settings");

  return { recent: getUserRecent({ userId, provider: "spotify" }) };
}

export default function ProfileRecent({
  loaderData: { recent },
}: Route.ComponentProps) {
  return (
    <>
      <p className="flex h-12 items-center text-muted-foreground text-sm">
        Listened
      </p>
      {recent && (
        <Suspense fallback={<Waver />}>
          <RecentList tracks={recent} />
        </Suspense>
      )}
    </>
  );
}

function RecentList(props: { tracks: UserRecent }) {
  const { tracks, count } = use(props.tracks);
  const rest = count - tracks.length;

  return (
    <div className="flex flex-col gap-y-2">
      {tracks.map((track) => {
        return <Track key={track.name} track={track} />;
      })}

      <p className="mx-auto font-semibold text-muted-foreground text-xs">
        {rest ? `+ ${rest}` : "NONE"}
      </p>
    </div>
  );
}
