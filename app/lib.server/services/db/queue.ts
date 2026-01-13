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
  // Find groups where user is owner or member
  const ownedGroups = await db.query.queueGroup.findMany({
    where: eq(queueGroup.userId, userId),
    with: {
      owner: true,
      members: {
        with: {
          user: true,
        },
      },
    },
  });

  const memberGroups = await db.query.queueGroupToUser.findMany({
    where: eq(queueGroupToUser.userId, userId),
    with: {
      group: {
        with: {
          owner: true,
          members: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  });

  const groups = [...ownedGroups, ...memberGroups.map((g) => g.group)].filter(
    (g) => !!g,
  );

  // Remove duplicates based on id
  const uniqueGroups = Array.from(
    new Map(groups.map((item) => [item.id, item])).values(),
  );

  return uniqueGroups;
}

export async function createQueueGroup(userId: string) {
  const userGroups = await getUserQueueGroups(userId);
  const nextNumber = userGroups.length + 1;
  const name = `Q${nextNumber}`;

  const id = generateId({ size: 12 });

  await db.insert(queueGroup).values({
    id,
    name,
    userId,
  });

  return id;
}

export async function getQueueGroup(groupId: string) {
  return db.query.queueGroup.findFirst({
    where: eq(queueGroup.id, groupId),
    with: {
      members: {
        with: {
          user: true,
        },
      },
      owner: true,
    },
  });
}

export async function getQueueItems(groupId: string) {
  return db.query.queueItem.findMany({
    where: eq(queueItem.groupId, groupId),
    with: {
      track: {
        with: {
          album: true,
          artists: {
            with: {
              artist: true,
            },
          },
        },
      },
      uploader: true,
      deliveries: {
        with: {
          user: true,
        },
      },
    },
    orderBy: (queueItem, { desc }) => [desc(queueItem.createdAt)],
  });
}

export async function deleteQueueGroup(args: {
  groupId: string;
  userId: string;
}) {
  const { groupId, userId } = args;
  
  // Delete the group (cascade will handle related records in _QueueGroupToUser, QueueItem, etc.)
  await db
    .delete(queueGroup)
    .where(and(eq(queueGroup.id, groupId), eq(queueGroup.userId, userId)));
}

export async function joinQueueGroup(args: {
  groupId: string;
  userId: string;
}) {
  const { groupId, userId } = args;

  // Check if owner
  const group = await db.query.queueGroup.findFirst({
    where: and(eq(queueGroup.id, groupId), eq(queueGroup.userId, userId)),
  });

  if (group) return;

  // Check if already a member
  const membership = await db.query.queueGroupToUser.findFirst({
    where: and(
      eq(queueGroupToUser.groupId, groupId),
      eq(queueGroupToUser.userId, userId),
    ),
  });

  if (membership) return;

  // Join
  await db.insert(queueGroupToUser).values({
    groupId,
    userId,
  });
}

export async function leaveQueueGroup(args: {
  groupId: string;
  userId: string;
}) {
  const { groupId, userId } = args;

  // Check if owner - owners cannot leave, they must delete the group
  const group = await db.query.queueGroup.findFirst({
    where: and(eq(queueGroup.id, groupId), eq(queueGroup.userId, userId)),
  });

  if (group) {
    throw new Error(
      "Owners cannot leave their own group. Delete the group instead.",
    );
  }

  // Remove membership
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

  await db.insert(queueItem).values({
    id,
    groupId,
    trackId,
    userId,
  });

  return id;
}

export async function updateQueueItemReaction(args: {
  queueItemId: string;
  userId: string;
  reaction: "like" | "dislike" | null | "";
}) {
  const { queueItemId, userId, reaction } = args;

  if (!reaction) {
    await db
      .delete(queueItemDelivery)
      .where(
        and(
          eq(queueItemDelivery.queueItemId, queueItemId),
          eq(queueItemDelivery.userId, userId),
        ),
      );
    return;
  }

  await db
    .insert(queueItemDelivery)
    .values({
      queueItemId,
      userId,
      reaction,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [queueItemDelivery.queueItemId, queueItemDelivery.userId],
      set: {
        reaction,
        updatedAt: new Date(),
      },
    });
}

export async function getGroupPlaybackStatuses(groupId: string) {
  const group = await db.query.queueGroup.findFirst({
    where: eq(queueGroup.id, groupId),
    with: {
      members: true,
    },
  });

  if (!group) return [];

  const userIds = [group.userId, ...group.members.map((m) => m.userId)];

  const playbacks = await db.query.playback.findMany({
    where: inArray(playback.userId, userIds),
  });

  const activeUserIds = new Set(playbacks.map((p) => p.userId));

  return userIds.map((userId) => ({
    userId,
    status: activeUserIds.has(userId) ? ("online" as const) : ("offline" as const),
  }));
}

export async function getUniqueGroupUserIds() {
  const groups = await db.query.queueGroup.findMany({
    with: {
      members: true,
    },
  });

  const userIds = new Set<string>();
  for (const group of groups) {
    userIds.add(group.userId);
    for (const member of group.members) {
      userIds.add(member.userId);
    }
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

  if (!playbackData || !playbackData.is_playing || !playbackData.trackId) {
    await db.delete(playback).where(eq(playback.userId, userId));
    return;
  }

  const now = new Date().toISOString();

  await db
    .insert(playback)
    .values({
      userId,
      trackId: playbackData.trackId,
      progress: playbackData.progress ?? 0,
      timestamp: playbackData.timestamp ?? 0,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [playback.userId],
      set: {
        trackId: playbackData.trackId,
        progress: playbackData.progress ?? 0,
        timestamp: playbackData.timestamp ?? 0,
        updatedAt: now,
      },
    });
}

export async function getNextQueueItemForDelivery(args: {
  groupId: string;
  userId: string;
}) {
  const { groupId, userId } = args;

  // Find items in this group that haven't been delivered to this user yet
  // A delivery exists if there's a record in queueItemDelivery for this user and item
  const undeliveredItem = await db.query.queueItem.findFirst({
    where: (fields, { eq, and, notExists }) => 
      and(
        eq(fields.groupId, groupId),
        ne(fields.userId, userId), // Don't deliver to the user who queued it
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
    with: {
      track: true,
    },
  });

  return undeliveredItem;
}

export async function recordQueueItemDelivery(args: {
  queueItemId: string;
  userId: string;
}) {
  const { queueItemId, userId } = args;
  await db.insert(queueItemDelivery).values({
    queueItemId,
    userId,
    updatedAt: new Date(),
  });
}
