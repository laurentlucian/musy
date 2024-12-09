import { type UserLiked, getUserLiked } from "@lib/services/db/tracks.server";
import { getTransferMachine } from "@lib/services/scheduler/machines/transfer.server";
import { syncUserLiked } from "@lib/services/scheduler/scripts/sync/liked.server";
import { transferUserLikedToYoutube } from "@lib/services/scheduler/scripts/transfer/liked";
import { logError } from "@lib/utils";
import { Suspense, use } from "react";
import { useFetcher } from "react-router";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useFetcherToast } from "~/hooks/useFetcherToast";
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
    <article className="flex flex-col gap-3 rounded-lg bg-card p-4 sm:flex-1">
      <div className="flex gap-x-2">
        <SyncButton />
        <TransferButton />
      </div>
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

function SyncButton() {
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";
  useFetcherToast(fetcher.data?.error, "synced all liked songs");

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="sync" />
      <Button type="submit" disabled={busy} size="sm">
        {busy ? "Syncing..." : "Sync"}
      </Button>
    </fetcher.Form>
  );
}

function TransferButton() {
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="transfer" />
      <div className="flex gap-x-2">
        <Button type="submit" disabled={busy} size="sm">
          {busy ? "Transferring..." : "Transfer"}
        </Button>
        <Input
          name="skip"
          placeholder="skip"
          type="number"
          className="h-9 w-20"
          defaultValue={0}
        />
      </div>
    </fetcher.Form>
  );
}

export async function action({
  request,
  context: { userId },
  params: { provider },
}: Route.ActionArgs) {
  if (!userId) return { error: "no user" };
  if (provider !== "spotify") return { error: "no support yet" };

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "sync") {
      await syncUserLiked(userId);
    }

    if (intent === "transfer") {
      await transferUserLikedToYoutube({
        userId,
        skip: Number(formData.get("skip")),
      });
      const transfer = getTransferMachine();
      transfer.send({ type: "REFRESH" });
    }

    return { error: null };
  } catch (error) {
    logError(error);
    return { error: error instanceof Error ? error.message : "unknown error" };
  }
}
