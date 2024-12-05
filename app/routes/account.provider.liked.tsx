import {
  type UserLiked,
  getUserLiked,
} from "@lib/services/prisma/tracks.server";
import { Suspense, use } from "react";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import type { Route } from "./+types/account.provider.liked";

export async function loader({
  context: { userId },
  params: { provider },
}: Route.LoaderArgs) {
  return { liked: userId ? getUserLiked({ userId, provider }) : null };
}

export default function AccountProviderLiked({
  loaderData: { liked },
}: Route.ComponentProps) {
  return (
    <article className="flex gap-3 rounded-lg bg-card p-4 sm:flex-1 sm:flex-col">
      {liked && (
        <Suspense fallback={<Waver />}>
          <LikedList tracks={liked} />
        </Suspense>
      )}
    </article>
  );
}

function LikedList(props: { tracks: UserLiked }) {
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
