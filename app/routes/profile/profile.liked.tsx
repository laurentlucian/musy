import { format } from "date-fns";
import { Plus, RefreshCcw } from "lucide-react";
import { Suspense, use } from "react";
import { data, redirect, useFetcher } from "react-router";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { userContext } from "~/context";
import { getUserLiked, type UserLiked } from "~/lib/services/db/tracks.server";
import { db } from "~/lib/services/db.server";
import { createPlaylistsByYear } from "~/lib/services/scheduler/scripts/create-playlists.server";
import { syncUserLikedFull } from "~/lib/services/scheduler/scripts/sync/liked.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";
import { Selector } from "~/routes/profile/utils/profile.utils";
import type { Route } from "./+types/profile.liked";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);
  const currentUserId = context.get(userContext);
  if (!userId) throw redirect("/");

  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const year = yearParam ? +yearParam : undefined;

  return {
    userId,
    currentUserId,
    year: year ?? null,
    liked: getUserLiked(db, { userId, provider: "spotify", year }),
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

  if (userId !== currentUserId) {
    return data({ success: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    const spotify = await getSpotifyClient({ userId });

    if (intent === "sync-liked") {
      await syncUserLikedFull({ userId, spotify });
      return data({ success: true });
    }

    if (intent === "create-playlists-by-year") {
      const result = await createPlaylistsByYear({ userId, spotify });
      return data(result);
    }

    return data({ success: false, error: "Invalid intent" }, { status: 400 });
  } catch (error) {
    return data(
      {
        success: false,
        error: error instanceof Error ? error.message : "Operation failed",
      },
      { status: 500 },
    );
  }
}

export default function ProfileLiked({
  loaderData: { userId, currentUserId, year, liked },
}: Route.ComponentProps) {
  const isOwnProfile = currentUserId === userId;

  return (
    <>
      <div className="flex items-center gap-2">
        <Selector year={year} />
        {isOwnProfile && (
          <div className="flex gap-2">
            <CreatePlaylistsButton userId={userId} />
            <LikedSyncButton userId={userId} />
          </div>
        )}
      </div>
      {liked && (
        <Suspense fallback={<Waver />}>
          <LikedList tracks={liked} />
        </Suspense>
      )}
    </>
  );
}

function LikedList(props: { tracks: UserLiked }) {
  const { tracks, count } = use(props.tracks);
  const rest = count - tracks.length;

  return (
    <div className="flex flex-col gap-y-2">
      {tracks.map((track) => {
        const extraInfo = track.likedAt
          ? format(new Date(track.likedAt), "MMM d, y")
          : undefined;
        return <Track key={track.name} track={track} extraInfo={extraInfo} />;
      })}

      <p className="mx-auto font-semibold text-muted-foreground text-xs">
        {rest ? `+ ${rest.toLocaleString()}` : "NONE"}
      </p>
    </div>
  );
}

function CreatePlaylistsButton({ userId }: { userId: string }) {
  const fetcher = useFetcher();
  const isCreating =
    fetcher.state === "submitting" || fetcher.state === "loading";

  const handleCreateByYear = () => {
    fetcher.submit(
      { intent: "create-playlists-by-year", userId },
      { method: "post" },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="sm" variant="outline" disabled={isCreating}>
          {isCreating ? <Waver /> : <Plus />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Playlists</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={handleCreateByYear}
              disabled={isCreating}
            >
              By Year
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LikedSyncButton({ userId }: { userId: string }) {
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
        fetcher.submit({ intent: "sync-liked", userId }, { method: "post" });
      }}
    >
      {isSyncing ? <Waver /> : <RefreshCcw />}
    </Button>
  );
}
