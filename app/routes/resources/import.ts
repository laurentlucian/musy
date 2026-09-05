import { data } from "react-router";
import { userContext } from "~/context";
import {
  getInitialImport,
  retryInitialImport,
} from "~/lib.server/services/scheduler/initial-import";
import type { Route } from "./+types/import";

export async function loader({ context }: Route.LoaderArgs) {
  const userId = context.get(userContext);
  if (!userId)
    return data(
      { import: null, error: "Sign in to continue." },
      { status: 401 },
    );
  try {
    return data(
      { import: await getInitialImport(userId), error: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return data(
      { import: null, error: "Progress unavailable. Reconnecting…" },
      { status: 503 },
    );
  }
}

export async function action({ context, request }: Route.ActionArgs) {
  const userId = context.get(userContext);
  if (!userId)
    return data(
      { import: null, error: "Sign in to continue." },
      { status: 401 },
    );
  if (request.headers.get("Origin") !== new URL(request.url).origin) {
    return data({ import: null, error: "Invalid request." }, { status: 403 });
  }
  try {
    await retryInitialImport(userId);
    return { import: await getInitialImport(userId), error: null };
  } catch {
    return data(
      { import: null, error: "Couldn’t retry. Try again." },
      { status: 503 },
    );
  }
}
