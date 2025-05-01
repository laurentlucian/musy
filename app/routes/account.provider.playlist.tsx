import type { Playlist } from "@lib/services/db.server";
import { getUserPlaylists } from "@lib/services/sdk/helpers/spotify.server";
import { Suspense, use } from "react";
import { Waver } from "~/components/icons/waver";

import type { Route } from "./+types/account.provider.playlist";

export async function loader({
  context: { userId },
  params: { provider },
}: Route.LoaderArgs) {
  return { playlists: userId ? getUserPlaylists({ userId, provider }) : null };
}

export default function AccountProviderPlaylists({
  loaderData: { playlists },
}: Route.ComponentProps) {
  return (
    <article className="flex flex-col gap-3 rounded-lg bg-card p-4 sm:flex-1">
      {playlists && (
        <Suspense fallback={<Waver />}>
          <PlaylistList playlists={playlists} />
        </Suspense>
      )}
    </article>
  );
}

function PlaylistList(props: { playlists: Promise<Playlist[]> }) {
  const playlists = use(props.playlists);
  const rest = playlists.length;

  return (
    <div className="flex flex-col gap-y-2">
      {playlists.map((playlist) => {
        return (
          <div
            key={playlist.id}
            className="flex flex-1 gap-x-2 rounded-md bg-primary-foreground px-3.5 py-3 transition-colors duration-150"
          >
            {playlist.name}
          </div>
        );
      })}

      <p className="mx-auto font-semibold text-muted-foreground text-xs">
        {rest ? `+ ${rest}` : "NONE"}
      </p>
    </div>
  );
}
