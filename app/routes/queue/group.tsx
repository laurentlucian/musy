import type { Route } from ".react-router/types/app/routes/queue/+types/group";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Circle,
  CircleAlert,
  CirclePause,
  LogOut,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Trash,
  X,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
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
  getGroupWorkflowStatuses,
  getQueueGroup,
  getQueueItems,
  joinQueueGroup,
  leaveQueueGroup,
  updateQueueItemReaction,
  type WorkflowStatus,
} from "~/lib.server/services/db/queue";
import { transformTracks } from "~/lib.server/services/sdk/helpers/spotify";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";
import { Loader } from "~/routes/profile/utils/profile.utils";

export async function loader({ context, params }: Route.LoaderArgs) {
  const userId = context.get(userContext);
  if (!userId) throw redirect("/");

  const groupId = params.groupId;
  if (!groupId) throw redirect("/queue");

  await joinQueueGroup({ groupId, userId });

  const [group, items, workflowStatuses] = await Promise.all([
    getQueueGroup(groupId),
    getQueueItems(groupId),
    getGroupWorkflowStatuses(groupId),
  ]);

  if (!group) throw redirect("/queue");

  const isOwner = group.userId === userId;

  return {
    group,
    items,
    userId,
    isOwner,
    workflowStatuses,
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
        const savedTrackIds = await transformTracks([spotifyTrack]);

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
      console.error("Failed to add track:", error);
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
  const { group, items, userId, isOwner, workflowStatuses } = loaderData;

  // Create a map of userId to workflow status
  const statusByUser = new Map(
    workflowStatuses.map((s) => [s.id.split("-").slice(1).join("-"), s]),
  );

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="flex-1 font-bold text-3xl">{group.name}</h1>
          <WorkflowStatusPanel
            group={group}
            statusByUser={statusByUser}
            currentUserId={userId}
          />
        </div>
        <div className="flex items-center gap-2">
          <AddTrackAction />
          {isOwner ? <DeleteGroupAction /> : <LeaveGroupAction />}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg text-center">
          <h3 className="font-semibold text-lg">Nothing yet</h3>
          <p className="text-muted-foreground text-sm">
            Queue tracks to this group to see them here.
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-2">
          {items.map((item) => {
            const myDelivery = item.deliveries.find((d) => d.userId === userId);

            return (
              <Link
                key={item.id}
                to={`/track/${item.track.id}`}
                viewTransition
                className="flex items-center gap-4 rounded-md bg-card p-4 shadow-sm transition-colors hover:bg-accent/50"
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

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    {myDelivery && (
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
                          <Plus className="h-2.5 w-2.5 text-primary-foreground" />
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
                              <ThumbsDown className="h-2.5 w-2.5 text-white" />
                            </div>
                          ) : (
                            <div className="absolute -right-1 -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-muted-foreground">
                              <Check
                                className="h-2.5 w-2.5 text-white"
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
              </Link>
            );
          })}
        </div>
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
  const fetcher = useFetcher();

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
        className={`h-8 w-8 ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground opacity-50 hover:opacity-100"}`}
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
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);
  const isAddingTrack = fetcher.formData?.get("intent") === "add-track";
  const error =
    fetcher.data && "error" in (fetcher.data as any)
      ? (fetcher.data as any).error
      : undefined;

  useEffect(() => {
    if (fetcher.data && "success" in (fetcher.data as any)) {
      setOpen(false);
    }
  }, [fetcher.data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Track</DialogTitle>
          <DialogDescription>
            Paste a Spotify link or track ID to add it to the queue.
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post" className="flex flex-col gap-4">
          <div className="relative">
            <Input
              required
              name="spotifyLink"
              placeholder="Paste Spotify Link"
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
              <div className="mt-2 flex items-center gap-2 text-destructive text-sm">
                <X className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              name="intent"
              value="add-track"
              disabled={isAddingTrack}
            >
              Queue
            </Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteGroupAction() {
  const fetcher = useFetcher();
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
          size="icon"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this group? This action cannot be
            undone.
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
              {isDeleting ? <Loader /> : "Delete"}
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
  const fetcher = useFetcher();
  const isLeaving = fetcher.formData?.get("intent") === "leave-group";

  return (
    <fetcher.Form method="post">
      <Button
        variant="ghost"
        size="icon"
        name="intent"
        value="leave-group"
        className="text-muted-foreground hover:text-destructive"
        disabled={isLeaving}
        title="Leave group"
      >
        {isLeaving ? <Loader /> : <LogOut className="h-4 w-4" />}
      </Button>
    </fetcher.Form>
  );
}

function WorkflowStatusPanel({
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
  statusByUser: Map<string, WorkflowStatus>;
  currentUserId: string;
}) {
  const allUsers = [
    { userId: group.userId, user: group.owner },
    ...group.members.map((m) => ({ userId: m.userId, user: m.user })),
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {allUsers.map(({ userId, user }) => {
        const status = statusByUser.get(userId);
        const isCurrentUser = userId === currentUserId;

        return (
          <div
            key={userId}
            className="flex items-center gap-2 rounded-md bg-accent/50 px-3 py-2"
          >
            <div className="relative">
              <Image
                src={user.image ?? ""}
                alt={user.name ?? "User"}
                className="h-6 w-6 shrink-0 rounded-full object-cover"
                height={24}
                width={24}
              />
              <div className="absolute -right-1 -bottom-1">
                <WorkflowStatusIcon status={status?.status ?? "not_started"} />
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

function WorkflowStatusIcon({ status }: { status: WorkflowStatus["status"] }) {
  switch (status) {
    case "running":
      return (
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
          <Zap className="h-2.5 w-2.5 text-white" />
        </div>
      );
    case "paused":
      return (
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500">
          <CirclePause className="h-2.5 w-2.5 text-white" />
        </div>
      );
    case "errored":
      return (
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive">
          <CircleAlert className="h-2.5 w-2.5 text-white" />
        </div>
      );
    case "complete":
    case "terminated":
      return (
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground">
          <Check className="h-2.5 w-2.5 text-white" />
        </div>
      );
    case "unknown":
      return (
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted">
          <Circle className="h-2.5 w-2.5 text-muted-foreground" />
        </div>
      );
  }
}
