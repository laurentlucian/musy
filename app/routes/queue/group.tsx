import type { Route } from ".react-router/types/app/routes/queue/+types/group";
import { env } from "cloudflare:workers";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Check,
  Copy,
  ListMusic,
  LogOut,
  MoreHorizontal,
  Pencil,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { data, Link, redirect, useFetcher, useRevalidator } from "react-router";
import { toast } from "sonner";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Image } from "~/components/ui/image";
import { Input } from "~/components/ui/input";
import { cn, logError } from "~/components/utils";
import { userContext } from "~/context";
import { db } from "~/lib.server/services/db";
import {
  addQueueItem,
  deleteQueueGroup,
  getGroupMemberIds,
  getPlaybacks,
  getQueueGroup,
  getQueueItems,
  isGroupMember,
  joinQueueGroup,
  leaveQueueGroup,
  renameQueueGroup,
  updateQueueItemReaction,
} from "~/lib.server/services/db/queue";
import { transformTracks } from "~/lib.server/services/sdk/helpers/spotify";
import { getSpotifyClient } from "~/lib.server/services/sdk/spotify";

const REFRESH_MS = 15_000;
const QUEUE_NAME_MAX = 40;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData?.group.name ?? "Queue"} · Shared queue` }];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const userId = context.get(userContext);
  if (!userId) throw redirect("/");

  const { groupId } = params;
  let group = await getQueueGroup(groupId);
  if (!group) throw redirect("/queue");

  if (!isGroupMember(group, userId)) {
    await joinQueueGroup({ groupId, userId });
    group = await getQueueGroup(groupId);
    if (!group) throw redirect("/queue");
  }

  const [items, playbacks] = await Promise.all([
    getQueueItems(groupId),
    getPlaybacks(getGroupMemberIds(group)),
  ]);

  return {
    group,
    items,
    playbacks,
    userId,
    isOwner: group.userId === userId,
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userId = context.get(userContext);
  if (!userId) throw redirect("/");

  const { groupId } = params;
  const group = await getQueueGroup(groupId);
  if (!group) throw redirect("/queue");
  if (!isGroupMember(group, userId)) {
    return data({ error: "Not a member" }, { status: 403 });
  }

  const isOwner = group.userId === userId;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "rename") {
    if (!isOwner) return data({ error: "Owner only" }, { status: 403 });
    const name = String(formData.get("name") ?? "")
      .trim()
      .slice(0, QUEUE_NAME_MAX);
    if (!name) return data({ error: "Name required" }, { status: 400 });
    await renameQueueGroup({ groupId, userId, name });
    return { success: true, intent };
  }

  if (intent === "delete-group") {
    if (!isOwner) return data({ error: "Owner only" }, { status: 403 });
    await deleteQueueGroup({ groupId, userId });
    return redirect("/queue");
  }

  if (intent === "leave-group") {
    if (isOwner) {
      return data({ error: "Delete the queue instead" }, { status: 400 });
    }
    await leaveQueueGroup({ groupId, userId });
    return redirect("/queue");
  }

  if (intent === "add-track") {
    const trackId = extractTrackId(String(formData.get("spotifyLink") ?? ""));
    if (!trackId) {
      return data({ error: "Paste a Spotify track link" }, { status: 400 });
    }

    try {
      const existing = await db.query.track.findFirst({
        where: (fields, { eq }) => eq(fields.id, trackId),
        columns: { id: true },
      });

      let finalTrackId = trackId;

      if (!existing) {
        const spotify = await getSpotifyClient({ userId });
        const response = await spotify.track.getTracks([trackId]);
        const spotifyTrack = response.tracks?.[0];
        if (!spotifyTrack) {
          return data({ error: "Track not found" }, { status: 404 });
        }

        const [savedId] = await transformTracks([spotifyTrack], spotify);
        if (!savedId) {
          return data({ error: "Couldn’t save track" }, { status: 500 });
        }
        finalTrackId = savedId;
      }

      await addQueueItem({ groupId, trackId: finalTrackId, userId });

      const listening = await getPlaybacks(
        getGroupMemberIds(group).filter((id) => id !== userId),
      );
      await Promise.allSettled(
        listening.map((p) =>
          env.DELIVERY_QUEUE.send({ groupId, userId: p.userId }),
        ),
      );

      return { success: true, intent };
    } catch (error) {
      logError(`Failed to add track: ${error}`, "queue");
      return data({ error: "Couldn’t add track. Try again." }, { status: 500 });
    }
  }

  if (intent === "reaction") {
    const queueItemId = String(formData.get("queueItemId") ?? "");
    const raw = formData.get("reaction");
    const reaction = raw === "like" || raw === "dislike" ? raw : null;
    const item = await db.query.queueItem.findFirst({
      where: (fields, { and, eq }) =>
        and(eq(fields.id, queueItemId), eq(fields.groupId, groupId)),
      columns: { id: true },
    });
    if (!item) return data({ error: "Track not found" }, { status: 404 });
    await updateQueueItemReaction({ queueItemId, userId, reaction });
    return { success: true, intent };
  }

  return data({ error: "Unknown action" }, { status: 400 });
}

type Person = { id: string; name: string | null; image: string | null };

export default function Group({ loaderData }: Route.ComponentProps) {
  const { group, items, playbacks, userId, isOwner } = loaderData;
  const { revalidate } = useRevalidator();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void revalidate();
    };
    const id = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [revalidate]);

  const listeningByUser = new Map(playbacks.map((p) => [p.userId, p.track]));
  const people: Person[] = [
    group.owner,
    ...group.members
      .filter((m) => m.userId !== group.userId)
      .map((m) => m.user),
  ];
  const name = group.name ?? "Queue";

  return (
    <section className="pb-4">
      <Link
        to="/queue"
        className="mb-8 inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Shared queues
      </Link>

      <header className="mb-8 border-border border-b pb-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h1 className="min-w-0 truncate font-semibold text-3xl tracking-tight sm:text-4xl">
            {name}
          </h1>
          <QueueMenu isOwner={isOwner} name={name} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Members
            people={people}
            currentUserId={userId}
            listeningByUser={listeningByUser}
          />
          <div className="flex flex-wrap items-center gap-2">
            <InviteButton />
            <AddTrackDialog />
          </div>
        </div>
      </header>

      <h2 className="mb-4 font-semibold text-xs uppercase">
        Tracks{" "}
        <span className="ml-2 text-muted-foreground">{items.length}</span>
      </h2>

      {items.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-border border-dashed px-6 py-20 text-center">
          <ListMusic
            className="mb-4 size-8 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <h3 className="font-semibold text-lg">No tracks yet</h3>
          <p className="mt-1 max-w-xs text-muted-foreground text-sm">
            {people.length === 1
              ? "Invite friends, then add tracks. They land in everyone’s Spotify queue."
              : "Add a track. It lands in everyone’s Spotify queue."}
          </p>
        </div>
      ) : (
        <ul className="flex w-full flex-col divide-y divide-border">
          {items.map((item) => (
            <QueueRow key={item.id} item={item} userId={userId} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Members({
  people,
  currentUserId,
  listeningByUser,
}: {
  people: Person[];
  currentUserId: string;
  listeningByUser: Map<string, { id: string; name: string } | null>;
}) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {people.map((person) => {
        const track = listeningByUser.get(person.id);
        const listening = listeningByUser.has(person.id);
        const label =
          person.id === currentUserId ? "You" : (person.name ?? "User");

        return (
          <li
            key={person.id}
            className="flex items-center gap-2"
            title={track ? `Listening to ${track.name}` : undefined}
          >
            <div className="relative">
              <Image
                src={person.image ?? ""}
                alt=""
                name={person.name}
                className="size-7 rounded-full object-cover"
                height={28}
                width={28}
              />
              <span
                aria-hidden
                className={cn(
                  "absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-background",
                  listening ? "bg-green-500" : "bg-muted-foreground/40",
                )}
              />
            </div>
            <span className="text-sm">
              {label}
              <span className="sr-only">
                {listening ? ", listening" : ", not listening"}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function QueueRow({
  item,
  userId,
}: {
  item: Route.ComponentProps["loaderData"]["items"][number];
  userId: string;
}) {
  const myDelivery = item.deliveries.find((d) => d.userId === userId);
  const canReact = !!myDelivery && item.userId !== userId;

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <Link
        to={`/track/${item.track.id}`}
        viewTransition
        className="flex min-w-0 flex-1 items-center gap-4 hover:text-primary"
      >
        <Image
          src={item.track.image}
          alt=""
          className="size-12 rounded-md object-cover"
          height={48}
          width={48}
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{item.track.name}</span>
          <span className="truncate text-muted-foreground text-sm">
            {item.track.artists.map((a) => a.artist.name).join(", ")}
          </span>
        </span>
      </Link>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-3">
          {canReact && (
            <div className="flex items-center gap-1">
              <ReactionButton
                queueItemId={item.id}
                reaction="like"
                isActive={myDelivery?.reaction === "like"}
              />
              <ReactionButton
                queueItemId={item.id}
                reaction="dislike"
                isActive={myDelivery?.reaction === "dislike"}
              />
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Avatar
              person={item.uploader}
              title={`Added by ${item.uploader?.name ?? "User"}`}
              badge={
                <Badge className="bg-primary">
                  <ListMusic className="size-2.5 text-primary-foreground" />
                </Badge>
              }
            />
            {item.deliveries.map((delivery) => (
              <Avatar
                key={delivery.id}
                person={delivery.user}
                muted
                title={`${delivery.user.name ?? "User"} · ${
                  delivery.reaction === "like"
                    ? "Liked"
                    : delivery.reaction === "dislike"
                      ? "Disliked"
                      : "Queued"
                }`}
                badge={
                  delivery.reaction === "like" ? (
                    <Badge className="bg-primary">
                      <ThumbsUp className="size-2.5 text-primary-foreground" />
                    </Badge>
                  ) : delivery.reaction === "dislike" ? (
                    <Badge className="bg-destructive">
                      <ThumbsDown className="size-2.5 text-destructive-foreground" />
                    </Badge>
                  ) : (
                    <Badge className="bg-muted-foreground">
                      <Check
                        className="size-2.5 text-background"
                        strokeWidth={3}
                      />
                    </Badge>
                  )
                }
              />
            ))}
          </div>
        </div>

        <time
          dateTime={new Date(item.createdAt).toISOString()}
          suppressHydrationWarning
          className="whitespace-nowrap text-muted-foreground text-xs"
        >
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </time>
      </div>
    </li>
  );
}

function Avatar({
  person,
  title,
  badge,
  muted,
}: {
  person: Person | null;
  title: string;
  badge: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="relative flex items-center" title={title}>
      <Image
        src={person?.image ?? ""}
        alt={title}
        name={person?.name}
        className={cn(
          "size-6 rounded-full object-cover",
          muted && "opacity-60 grayscale",
        )}
        height={24}
        width={24}
      />
      {badge}
    </div>
  );
}

function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full",
        className,
      )}
    >
      {children}
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
  const pending = fetcher.formData?.get("reaction");
  const active = pending != null ? pending === reaction : isActive;

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="reaction" />
      <input type="hidden" name="queueItemId" value={queueItemId} />
      <input type="hidden" name="reaction" value={isActive ? "" : reaction} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label={reaction === "like" ? "Like" : "Dislike"}
        aria-pressed={active}
        className={active ? "bg-accent text-accent-foreground" : undefined}
      >
        {reaction === "like" ? (
          <ThumbsUp className="size-4" />
        ) : (
          <ThumbsDown className="size-4" />
        )}
      </Button>
    </fetcher.Form>
  );
}

function InviteButton() {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="outline"
      onClick={async () => {
        const url = window.location.href;
        try {
          if (navigator.share) {
            await navigator.share({ url });
            return;
          }
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
          toast.error("Copy this page’s address to invite");
        }
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Link copied" : "Invite"}
    </Button>
  );
}

function AddTrackDialog() {
  const fetcher = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);
  const busy = fetcher.state !== "idle";
  const error =
    !busy && fetcher.data && "error" in fetcher.data
      ? fetcher.data.error
      : undefined;

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (fetcher.data && "success" in fetcher.data) {
      setOpen(false);
      toast.success("Added");
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Add track
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add track</DialogTitle>
          <DialogDescription>
            Paste a Spotify track link. It lands in everyone’s queue.
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post" className="flex flex-col gap-4">
          <input type="hidden" name="intent" value="add-track" />
          <div>
            <div className="relative">
              <Input
                required
                name="spotifyLink"
                aria-label="Spotify track link"
                aria-invalid={!!error}
                placeholder="https://open.spotify.com/track/…"
                autoComplete="off"
                disabled={busy}
                autoFocus
                onPaste={(e) => {
                  const form = e.currentTarget.form;
                  if (!form) return;
                  const text = e.clipboardData.getData("text");
                  if (!extractTrackId(text)) return;
                  e.preventDefault();
                  e.currentTarget.value = text;
                  form.requestSubmit();
                }}
              />
              {busy && (
                <div className="absolute top-1/2 right-2 -translate-y-1/2">
                  <Waver />
                </div>
              )}
            </div>
            {error && (
              <p role="alert" className="mt-2 text-destructive text-sm">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Adding…" : "Add"}
            </Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

function QueueMenu({ isOwner, name }: { isOwner: boolean; name: string }) {
  const [dialog, setDialog] = useState<"rename" | "delete" | null>(null);
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";
  const error =
    !busy && fetcher.data && "error" in fetcher.data
      ? fetcher.data.error
      : undefined;

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (fetcher.data && "success" in fetcher.data) setDialog(null);
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Queue options">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isOwner ? (
            <>
              <DropdownMenuItem onClick={() => setDialog("rename")}>
                <Pencil className="size-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDialog("delete")}
              >
                <Trash className="size-4" /> Delete queue
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              variant="destructive"
              disabled={busy}
              onClick={() =>
                void fetcher.submit(
                  { intent: "leave-group" },
                  { method: "post" },
                )
              }
            >
              <LogOut className="size-4" /> Leave queue
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={dialog === "rename"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename queue</DialogTitle>
          </DialogHeader>
          <fetcher.Form method="post" className="flex flex-col gap-4">
            <input type="hidden" name="intent" value="rename" />
            <div>
              <Input
                required
                name="name"
                aria-label="Queue name"
                aria-invalid={!!error}
                defaultValue={name}
                maxLength={QUEUE_NAME_MAX}
                autoComplete="off"
                disabled={busy}
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
              />
              {error && (
                <p role="alert" className="mt-2 text-destructive text-sm">
                  {error}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setDialog(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </Button>
            </div>
          </fetcher.Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog === "delete"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete queue?</DialogTitle>
            <DialogDescription>
              Removes it for everyone. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setDialog(null)}
            >
              Cancel
            </Button>
            <fetcher.Form method="post">
              <Button
                type="submit"
                name="intent"
                value="delete-group"
                variant="destructive"
                disabled={busy}
              >
                {busy ? "Deleting…" : "Delete"}
              </Button>
            </fetcher.Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function extractTrackId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(
    /(?:open\.spotify\.com\/(?:[\w-]+\/)?track\/|spotify:track:)([A-Za-z0-9]{22})/,
  );
  if (match) return match[1];

  return /^[A-Za-z0-9]{22}$/.test(trimmed) ? trimmed : null;
}
