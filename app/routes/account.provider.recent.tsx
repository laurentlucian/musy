import { Suspense, use } from "react";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import {
  type UserRecent,
  getUserRecent,
} from "~/services/prisma/tracks.server";
import type { Route } from "./+types/account.provider.recent";

export async function loader({
  context: { userId },
  params: { provider },
}: Route.LoaderArgs) {
  return { recent: userId ? getUserRecent({ userId, provider }) : null };
}

export default function AccountProviderRecent({
  loaderData: { recent },
}: Route.ComponentProps) {
  return (
    <article className="flex flex-1 gap-3 rounded-lg bg-card p-4 sm:flex-col">
      {recent && (
        <Suspense fallback={<Waver />}>
          <RecentList tracks={recent} />
        </Suspense>
      )}
    </article>
  );
}

function RecentList(props: { tracks: UserRecent }) {
  const { tracks, count } = use(props.tracks);
  const rest = count - tracks.length;

  return (
    <div className="flex flex-col gap-y-2">
      {tracks.map((track) => {
        return (
          <Track
            key={track.name}
            id={track.id}
            uri={track.uri}
            image={track.image}
            artist={track.artist}
            name={track.name}
          />
        );
      })}

      <p className="mx-auto font-semibold text-muted-foreground text-xs">
        {rest ? `+ ${rest}` : "NONE"}
      </p>
    </div>
  );
}
