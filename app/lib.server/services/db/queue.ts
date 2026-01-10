import { env } from "cloudflare:workers";
import { and, eq, ne, or } from "drizzle-orm";
import {
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

export type WorkflowStatus = {
  id: string;
  status:
    | "running"
    | "paused"
    | "errored"
    | "terminated"
    | "complete"
    | "unknown"
    | "not_started";
  error?: string;
};

export async function getWorkflowStatus(args: {
  groupId: string;
  userId: string;
}): Promise<WorkflowStatus> {
  const { groupId, userId } = args;
  const wfId = `${groupId}-${userId}`;

  try {
    const wf = await env.WORKFLOW_QUEUE.get(wfId).catch(() => null);
    if (!wf) {
      return { id: wfId, status: "not_started" };
    }

    const status = await wf.status();
    return {
      id: wfId,
      status: status.status as WorkflowStatus["status"],
      error: status.error?.message,
    };
  } catch (error) {
    console.error(`Failed to get workflow status for ${wfId}`, error);
    return { id: wfId, status: "unknown" };
  }
}

export async function getGroupWorkflowStatuses(
  groupId: string,
): Promise<WorkflowStatus[]> {
  // Get all members including owner
  const group = await db.query.queueGroup.findFirst({
    where: eq(queueGroup.id, groupId),
    with: {
      members: true,
    },
  });

  if (!group) return [];

  const allUserIds = [group.userId, ...group.members.map((m) => m.userId)];

  const statuses = await Promise.all(
    allUserIds.map((userId) => getWorkflowStatus({ groupId, userId })),
  );

  return statuses;
}

export async function deleteQueueGroup(args: {
  groupId: string;
  userId: string;
}) {
  const { groupId, userId } = args;

  // Get all members to cancel their workflows
  const members = await db.query.queueGroupToUser.findMany({
    where: eq(queueGroupToUser.groupId, groupId),
  });

  // Cancel workflows for all members (including owner)
  const group = await db.query.queueGroup.findFirst({
    where: eq(queueGroup.id, groupId),
  });

  const allUserIds = [
    ...(group ? [group.userId] : []),
    ...members.map((m) => m.userId),
  ];

  await Promise.all(
    allUserIds.map(async (memberId) => {
      const wfId = `${groupId}-${memberId}`;
      try {
        const wf = await env.WORKFLOW_QUEUE.get(wfId);
        if (wf) {
          await wf.terminate();
          console.log(`Cancelled workflow for user ${memberId}`);
        }
      } catch (_error) {
        // Workflow may not exist, ignore
        console.log(`No workflow to cancel for user ${memberId}`);
      }
    }),
  );

  // Delete the group (cascade will handle related records)
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

  // Cancel the user's workflow
  const wfId = `${groupId}-${userId}`;
  try {
    const wf = await env.WORKFLOW_QUEUE.get(wfId);
    if (wf) {
      await wf.terminate();
      console.log(`Cancelled workflow for departing user ${userId}`);
    }
  } catch (_error) {
    // Workflow may not exist, ignore
    console.log(`No workflow to cancel for user ${userId}`);
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

  // Get all potential recipients (owner + members)
  const group = await db.query.queueGroup.findFirst({
    where: eq(queueGroup.id, groupId),
    with: {
      members: true,
    },
  });

  if (!group) return id;

  const recipientIds = [
    group.userId,
    ...group.members.map((m) => m.userId),
  ].filter((id) => id !== userId); // Exclude the uploader

  const workflows = recipientIds.map(async (recipientId) => {
    const wfId = `${groupId}-${recipientId}`;
    try {
      const wf = await env.WORKFLOW_QUEUE.get(wfId).catch(() => null);

      if (!wf) {
        await env.WORKFLOW_QUEUE.create({
          id: wfId,
          params: {
            groupId,
            userId: recipientId,
          },
        });
        console.log("workflow created", recipientId);
      } else {
        await wf.sendEvent({
          type: "track_added",
          payload: {},
        });
        console.log("workflow event triggered", recipientId);
      }
    } catch (error) {
      console.error(`Failed to manage workflow for ${wfId}`, error);
    }
  });

  await Promise.all(workflows);

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

export async function getNextQueueItemForDelivery(args: {
  groupId: string;
  userId: string;
}) {
  const { groupId, userId } = args;

  const items = await db.query.queueItem.findMany({
    where: and(eq(queueItem.groupId, groupId), ne(queueItem.userId, userId)),
    orderBy: (queueItem, { asc }) => [asc(queueItem.createdAt)],
    with: {
      track: true,
      deliveries: {
        where: eq(queueItemDelivery.userId, userId),
      },
    },
  });

  return items.find((item) => item.deliveries.length === 0);
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
