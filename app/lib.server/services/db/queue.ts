import { and, eq, inArray, ne } from "drizzle-orm";
import {
  playback,
  queueGroup,
  queueGroupToUser,
  queueItem,
  queueItemDelivery,
} from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";
import { generateId } from "~/lib.server/services/utils";

export async function getUserQueueGroups(userId: string) {
  const [ownedGroups, memberships] = await Promise.all([
    db.query.queueGroup.findMany({
      where: eq(queueGroup.userId, userId),
      with: { owner: true, members: { with: { user: true } } },
    }),
    db.query.queueGroupToUser.findMany({
      where: eq(queueGroupToUser.userId, userId),
      with: {
        group: {
          with: { owner: true, members: { with: { user: true } } },
        },
      },
    }),
  ]);

  const groups = [...ownedGroups, ...memberships.map((m) => m.group)].filter(
    (g) => !!g,
  );

  return Array.from(new Map(groups.map((g) => [g.id, g])).values());
}

export async function createQueueGroup(userId: string) {
  const userGroups = await getUserQueueGroups(userId);
  const id = generateId({ size: 12 });

  await db.insert(queueGroup).values({
    id,
    name: `Q${userGroups.length + 1}`,
    userId,
  });

  return id;
}

export async function getQueueGroup(groupId: string) {
  return db.query.queueGroup.findFirst({
    where: eq(queueGroup.id, groupId),
    with: { members: { with: { user: true } }, owner: true },
  });
}

export type QueueGroup = NonNullable<Awaited<ReturnType<typeof getQueueGroup>>>;

export function getGroupMemberIds(group: {
  userId: string;
  members: { userId: string }[];
}) {
  return Array.from(
    new Set([group.userId, ...group.members.map((m) => m.userId)]),
  );
}

export function isGroupMember(group: QueueGroup, userId: string) {
  return getGroupMemberIds(group).includes(userId);
}

export async function renameQueueGroup(args: {
  groupId: string;
  userId: string;
  name: string;
}) {
  const { groupId, userId, name } = args;
  await db
    .update(queueGroup)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(queueGroup.id, groupId), eq(queueGroup.userId, userId)));
}

export async function getQueueItems(groupId: string) {
  return db.query.queueItem.findMany({
    where: eq(queueItem.groupId, groupId),
    with: {
      track: { with: { album: true, artists: { with: { artist: true } } } },
      uploader: true,
      deliveries: { with: { user: true } },
    },
    orderBy: (queueItem, { desc }) => [desc(queueItem.createdAt)],
  });
}

export async function deleteQueueGroup(args: {
  groupId: string;
  userId: string;
}) {
  const { groupId, userId } = args;
  await db
    .delete(queueGroup)
    .where(and(eq(queueGroup.id, groupId), eq(queueGroup.userId, userId)));
}

export async function joinQueueGroup(args: {
  groupId: string;
  userId: string;
}) {
  const { groupId, userId } = args;
  await db
    .insert(queueGroupToUser)
    .values({ groupId, userId })
    .onConflictDoNothing();
}

export async function leaveQueueGroup(args: {
  groupId: string;
  userId: string;
}) {
  const { groupId, userId } = args;
  await db
    .delete(queueGroupToUser)
    .where(
      and(
        eq(queueGroupToUser.groupId, groupId),
        eq(queueGroupToUser.userId, userId),
      ),
    );
}

export async function addQueueItem(args: {
  groupId: string;
  trackId: string;
  userId: string;
}) {
  const { groupId, trackId, userId } = args;
  const id = generateId({ size: 12 });

  await db.insert(queueItem).values({ id, groupId, trackId, userId });

  return id;
}

export async function updateQueueItemReaction(args: {
  queueItemId: string;
  userId: string;
  reaction: "like" | "dislike" | null;
}) {
  const { queueItemId, userId, reaction } = args;
  await db
    .update(queueItemDelivery)
    .set({ reaction, updatedAt: new Date() })
    .where(
      and(
        eq(queueItemDelivery.queueItemId, queueItemId),
        eq(queueItemDelivery.userId, userId),
      ),
    );
}

export async function getPlaybacks(userIds: string[]) {
  if (userIds.length === 0) return [];
  return db.query.playback.findMany({
    where: inArray(playback.userId, userIds),
    columns: { userId: true, updatedAt: true },
    with: { track: { columns: { id: true, name: true } } },
  });
}

export async function getUniqueGroupUserIds() {
  const groups = await db.query.queueGroup.findMany({
    columns: { userId: true },
    with: { members: { columns: { userId: true } } },
  });

  const userIds = new Set<string>();
  for (const group of groups) {
    for (const id of getGroupMemberIds(group)) userIds.add(id);
  }

  return Array.from(userIds);
}

export async function updatePlaybackStatus(args: {
  userId: string;
  playback: {
    trackId?: string;
    progress?: number;
    timestamp?: number;
    is_playing: boolean;
  } | null;
}) {
  const { userId, playback: playbackData } = args;

  if (!playbackData?.is_playing || !playbackData.trackId) {
    await db.delete(playback).where(eq(playback.userId, userId));
    return;
  }

  const now = new Date().toISOString();
  const values = {
    trackId: playbackData.trackId,
    progress: playbackData.progress ?? 0,
    timestamp: playbackData.timestamp ?? 0,
    updatedAt: now,
  };

  await db
    .insert(playback)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: [playback.userId], set: values });
}

export async function getNextQueueItemForDelivery(args: {
  groupId: string;
  userId: string;
}) {
  const { groupId, userId } = args;

  return db.query.queueItem.findFirst({
    where: (fields, { eq, and, notExists }) =>
      and(
        eq(fields.groupId, groupId),
        ne(fields.userId, userId),
        notExists(
          db
            .select()
            .from(queueItemDelivery)
            .where(
              and(
                eq(queueItemDelivery.queueItemId, fields.id),
                eq(queueItemDelivery.userId, userId),
              ),
            ),
        ),
      ),
    orderBy: (fields, { asc }) => [asc(fields.createdAt)],
    with: { track: true },
  });
}

export async function recordQueueItemDelivery(args: {
  queueItemId: string;
  userId: string;
}) {
  const { queueItemId, userId } = args;
  await db
    .insert(queueItemDelivery)
    .values({ queueItemId, userId, updatedAt: new Date() })
    .onConflictDoNothing();
}
