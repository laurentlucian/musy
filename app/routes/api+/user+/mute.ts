import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { typedjson } from "remix-typedjson";

import { prisma } from "~/services/db.server";
import { getCurrentUserId } from "~/services/prisma/users.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const currentUserId = await getCurrentUserId(request);
  const body = await request.formData();
  const userId = body.get("userId");
  const isNotMuted = body.get("isNotMuted");
  const muteId = body.get("muteId");

  if (
    typeof userId !== "string" ||
    typeof muteId !== "string" ||
    typeof isNotMuted !== "string"
  ) {
    return typedjson("Bad Request");
  }

  if (isNotMuted === "true") {
    await prisma.mute.create({
      data: {
        muted: {
          connect: { userId },
        },
        user: {
          connect: { userId: currentUserId },
        },
      },
    });
  } else if (isNotMuted === "false") {
    await prisma.mute.delete({
      where: {
        id: Number(muteId),
      },
    });
  }
  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};

export default () => null;
