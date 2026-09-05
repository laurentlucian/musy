import type { Route } from ".react-router/types/app/routes/queue/+types/group";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Copy,
  Check,
  Circle,
  ListMusic,
  LogOut,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Image } from "~/components/ui/image";
import { Input } from "~/components/ui/input";
import { userContext } from "~/context";
import { db } from "~/lib.server/services/db";
import {
  addQueueItem,
  deleteQueueGroup,
  getGroupPlaybackStatuses,
  getQueueGroup,
  getQueueItems,
  joinQueueGroup,
  leaveQueueGroup,
  updateQueueItemReaction,
} from "~/lib.server/services/db/queue";
import { transformTracks } from "~/lib.server/services/sdk/helpers/spotify";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import { Loader } from "~/routes/profile/utils/profile.utils";
import { logError } from "~/components/utils";

export async function loader({ context, params }: Route.LoaderArgs) {
  const userId = context.get(userContext);
  if (!userId) throw redirect("/");

  const groupId = params.groupId;
  if (!groupId) throw redirect("/queue");

  await joinQueueGroup({ groupId, userId });

  const [group, items, playbackStatuses] = await Promise.all([
    getQueueGroup(groupId),
    getQueueItems(groupId),
    getGroupPlaybackStatuses(groupId),
  ]);

  if (!group) throw redirect("/queue");

  const isOwner = group.userId === userId;

  return {
    group,
    items,
    userId,
    isOwner,
    playbackStatuses,
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = context.get(userContext);
  if (!userId) throw redirect("/");

  const groupId = params.groupId;
  if (!groupId) return null;

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete-group") {
    await deleteQueueGroup({ groupId, userId });
    return redirect("/queue");
  }

  if (intent === "leave-group") {
    try {
      await leaveQueueGroup({ groupId, userId });
      return redirect("/queue");
    } catch (error) {
      return data(
        {
          error:
            error instanceof Error ? error.message : "Failed to leave group",
        },
        { status: 400 },
      );
    }
  }

  if (intent === "add-track") {
    const spotifyLink = formData.get("spotifyLink") as string;
    const trackId = extractTrackId(spotifyLink);

    if (!trackId) {
      return data(
        { error: "Invalid Spotify link or track ID" },
        { status: 400 },
      );
    }

    try {
      // Check if track exists
      const existingTrack = await db.query.track.findFirst({
        where: (fields, { eq }) => eq(fields.id, trackId),
      });

      let finalTrackId = trackId;

      if (!existingTrack) {
        // Fetch from Spotify
        const spotify = await getSpotifyClient({ userId });
        const response = await spotify.track.getTracks([trackId]);

        if (!response.tracks || response.tracks.length === 0) {
          return data({ error: "Track not found on Spotify" }, { status: 404 });
        }

        const spotifyTrack = response.tracks[0];

        // Transform and save track
        const savedTrackIds = await transformTracks([spotifyTrack], spotify);

        if (savedTrackIds.length === 0) {
          return data(
            { error: "Failed to save track to database" },
            { status: 500 },
          );
        }

        finalTrackId = savedTrackIds[0];
      }

      // Add to queue
      await addQueueItem({
        groupId,
        trackId: finalTrackId,
        userId,
      });

      return { success: true };
    } catch (error) {
      logError(`Failed to add track: ${error}`, "queue");
      return data(
        { error: "Failed to add track. Please try again." },
        { status: 500 },
      );
    }
  }

  if (intent === "reaction") {
    const queueItemId = formData.get("queueItemId") as string;
    const reaction = formData.get("reaction") as "like" | "dislike" | null;
    await updateQueueItemReaction({ queueItemId, userId, reaction });
    return { success: true };
  }

  return null;
}

export default function Group({ loaderData }: Route.ComponentProps) {
  const { group, items, userId, isOwner, playbackStatuses } = loaderData;

  // Create a map of userId to playback status
  const statusByUser = new Map(
    playbackStatuses.map((s) => [s.userId, s.status]),
  );

  return (
    <section className="pb-4">
      <Link
        to="/queue"
        className="mb-8 inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Shared queues
      </Link>
      <header className="mb-8 border-border border-b pb-4">
        <h1 className="font-semibold text-2xl sm:text-3xl">{group.name}</h1>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
          <PlaybackStatusPanel
            group={group}
            statusByUser={statusByUser}
            currentUserId={userId}
          />
          <div className="flex flex-wrap items-center gap-2">
            <InviteAction />
            <AddTrackAction />
          </div>
        </div>
      </header>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-xs uppercase">
          Tracks{" "}
          <span className="ml-2 text-muted-foreground">{items.length}</span>
        </h2>
        {isOwner ? <DeleteGroupAction /> : <LeaveGroupAction />}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-border border-y py-16 text-center">
          <h3 className="font-semibold text-3xl">No tracks yet</h3>
        </div>
      ) : (
        <div className="flex w-full flex-col divide-y divide-border">
          {items.map((item) => {
            const myDelivery = item.deliveries.find((d) => d.userId === userId);

            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 py-5"
              >
                <Link
                  to={`/track/${item.track.id}`}
                  viewTransition
                  className="flex min-w-0 flex-1 items-center gap-4 hover:text-primary"
                >
                  <Image
                    src={item.track.image}
                    alt={item.track.name}
                    className="h-12 w-12 rounded-md object-cover"
                    height={48}
                    width={48}
                  />
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="truncate font-medium">
                      {item.track.name}
                    </span>
                    <span className="truncate text-muted-foreground text-sm">
                      {item.track.artists.map((a) => a.artist.name).join(", ")}
                    </span>
                  </div>
                </Link>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    {myDelivery && userId !== item.userId && (
                      <div className="flex items-center gap-1">
                        <ReactionButton
                          queueItemId={item.id}
                          reaction="like"
                          isActive={myDelivery.reaction === "like"}
                        />
                        <ReactionButton
                          queueItemId={item.id}
                          reaction="dislike"
                          isActive={myDelivery.reaction === "dislike"}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <div
                        className="relative flex items-center"
                        title={`Queued by ${item.uploader?.name ?? "User"}`}
                      >
                        <Image
                          src={item.uploader?.image ?? ""}
                          alt={item.uploader?.name ?? "User"}
                          className="h-6 w-6 rounded-full object-cover"
                          height={24}
                          width={24}
                        />
                        <div className="absolute -right-1 -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary">
                          <ListMusic className="h-2.5 w-2.5 text-primary-foreground" />
                        </div>
                      </div>

                      {item.deliveries.map((delivery) => (
                        <div
                          key={delivery.id}
                          className="relative flex items-center"
                        >
                          <Image
                            src={delivery.user.image ?? ""}
                            alt={delivery.user.name ?? "User"}
                            className="h-6 w-6 rounded-full object-cover opacity-60 grayscale"
                            height={24}
                            width={24}
                          />
                          {delivery.reaction === "like" ? (
                            <div className="absolute -right-1 -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary">
                              <ThumbsUp className="h-2.5 w-2.5 text-primary-foreground" />
                            </div>
                          ) : delivery.reaction === "dislike" ? (
                            <div className="absolute -right-1 -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive">
                              <ThumbsDown className="h-2.5 w-2.5 text-destructive-foreground" />
                            </div>
                          ) : (
                            <div className="absolute -right-1 -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-muted-foreground">
                              <Check
                                className="h-2.5 w-2.5 text-background"
                                strokeWidth={3}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <span className="whitespace-nowrap text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InviteAction() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div>
      <Button
        variant="outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setError(false);
            window.setTimeout(() => setCopied(false), 2500);
          } catch {
            setError(true);
          }
        }}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Link copied" : "Invite friends"}
      </Button>
      {error && (
        <p role="alert" className="mt-2 max-w-48 text-destructive text-xs">
          Copy this page’s address to invite friends.
        </p>
      )}
    </div>
  );
}

function ReactionButton({
  queueItemId,
  reaction,
  isActive,
}: {
  queueItemId: string;
  reaction: "like" | "dislike";
  isActive: boolean;
}) {
  const fetcher = useFetcher<typeof action>();

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="reaction" />
      <input type="hidden" name="queueItemId" value={queueItemId} />
      <input
        type="hidden"
        name="reaction"
        value={isActive ? "" : reaction} // Toggle off if already active
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label={reaction === "like" ? "Like track" : "Dislike track"}
        aria-pressed={isActive}
        disabled={fetcher.state !== "idle"}
        className={isActive ? "bg-accent text-accent-foreground" : undefined}
      >
        {reaction === "like" ? (
          <ThumbsUp className="h-4 w-4" />
        ) : (
          <ThumbsDown className="h-4 w-4" />
        )}
      </Button>
    </fetcher.Form>
  );
}

function AddTrackAction() {
  const fetcher = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);
  const isAddingTrack = fetcher.formData?.get("intent") === "add-track";
  const error =
    fetcher.data && "error" in fetcher.data ? fetcher.data.error : undefined;

  useEffect(() => {
    if (fetcher.data && "success" in fetcher.data) {
      setOpen(false);
    }
  }, [fetcher.data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Add track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-3xl">
            Add a track
          </DialogTitle>
          <DialogDescription>
            Paste a Spotify link or track ID to add it to the queue.
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post" className="flex flex-col gap-4">
          <input type="hidden" name="intent" value="add-track" />
          <div className="relative">
            <Input
              required
              name="spotifyLink"
              aria-label="Spotify track link or ID"
              placeholder="Spotify track link or ID"
              className="w-full"
              disabled={isAddingTrack}
              autoFocus
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
            {isAddingTrack && (
              <div className="absolute top-1/2 right-2 -translate-y-1/2">
                <Waver />
              </div>
            )}
            {error && !isAddingTrack && (
              <div
                role="alert"
                className="mt-2 flex items-center gap-2 text-destructive text-sm"
              >
                <X className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isAddingTrack}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAddingTrack}>
              {isAddingTrack ? "Adding…" : "Add to queue"}
            </Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteGroupAction() {
  const fetcher = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);
  const isDeleting = fetcher.formData?.get("intent") === "delete-group";

  useEffect(() => {
    if (
      fetcher.data &&
      typeof fetcher.data === "object" &&
      "success" in fetcher.data
    ) {
      setOpen(false);
    }
  }, [fetcher.data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash className="h-4 w-4" /> Delete queue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete queue?</DialogTitle>
          <DialogDescription>
            This removes the shared queue for everyone. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <fetcher.Form method="post">
            <Button
              type="submit"
              name="intent"
              value="delete-group"
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader /> Deleting…
                </>
              ) : (
                "Delete queue"
              )}
            </Button>
          </fetcher.Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function extractTrackId(input: string): string | null {
  if (!input) return null;

  const trimmed = input.trim();

  // Handle URL format: https://open.spotify.com/track/{trackId}?...
  const urlMatch = trimmed.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];

  // Handle URI format: spotify:track:{trackId}
  const uriMatch = trimmed.match(/spotify:track:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  // Check if it's a raw 22-character Spotify track ID
  const idMatch = trimmed.match(/^[a-zA-Z0-9]{22}$/);
  if (idMatch) return trimmed;

  return null;
}

function LeaveGroupAction() {
  const fetcher = useFetcher<typeof action>();
  const isLeaving = fetcher.formData?.get("intent") === "leave-group";

  return (
    <fetcher.Form method="post">
      <Button
        variant="ghost"
        size="sm"
        name="intent"
        value="leave-group"
        className="text-muted-foreground hover:text-destructive"
        disabled={isLeaving}
        title="Leave queue"
      >
        {isLeaving ? <Loader /> : <LogOut className="h-4 w-4" />}{" "}
        {isLeaving ? "Leaving…" : "Leave queue"}
      </Button>
      {fetcher.data &&
        typeof fetcher.data === "object" &&
        "error" in fetcher.data && (
          <p role="alert" className="text-destructive text-sm">
            {String(fetcher.data.error)}
          </p>
        )}
    </fetcher.Form>
  );
}

function PlaybackStatusPanel({
  group,
  statusByUser,
  currentUserId,
}: {
  group: {
    userId: string;
    owner: { id: string; name: string | null; image: string | null };
    members: {
      userId: string;
      user: { id: string; name: string | null; image: string | null };
    }[];
  };
  statusByUser: Map<string, "online" | "offline">;
  currentUserId: string;
}) {
  const allUsers = [
    { userId: group.userId, user: group.owner },
    ...group.members
      .filter((m) => m.userId !== group.userId)
      .map((m) => ({ userId: m.userId, user: m.user })),
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {allUsers.map(({ userId, user }) => {
        const status = statusByUser.get(userId) ?? "offline";
        const isCurrentUser = userId === currentUserId;

        return (
          <div key={userId} className="flex items-center gap-2 py-2 pr-3">
            <div className="relative">
              <Image
                src={user.image ?? ""}
                alt={user.name ?? "User"}
                className="h-6 w-6 shrink-0 rounded-full object-cover"
                height={24}
                width={24}
              />
              <div className="absolute -right-1 -bottom-1">
                <PlaybackStatusIcon status={status} />
              </div>
            </div>
            <span className="text-sm">
              {isCurrentUser ? "You" : (user.name ?? "User")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PlaybackStatusIcon({ status }: { status: "online" | "offline" }) {
  switch (status) {
    case "online":
      return (
        <div
          className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-foreground"
          title="Online"
        >
          <Circle className="h-2 w-2 fill-current text-background" />
        </div>
      );
    case "offline":
      return (
        <div
          className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-muted-foreground/30"
          title="Offline"
        >
          <Circle className="h-2 w-2 fill-current text-muted-foreground" />
        </div>
      );
  }
}
