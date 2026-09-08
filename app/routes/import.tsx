import { data, redirect } from "react-router";
import { HistoryImport } from "~/components/domain/history-import";
import { userContext } from "~/context";
import { getHistoryImport } from "~/lib.server/services/history-import";
import { commitSession, getSession } from "~/lib.server/services/session";
import type { Route } from "./+types/import";

export async function loader({ context, request }: Route.LoaderArgs) {
  const userId = context.get(userContext);
  if (!userId) throw redirect("/");
  const session = await getSession(request.headers.get("cookie"));
  return {
    historyImport: await getHistoryImport(userId),
    requested: session.get("historyRequestedBy") === userId,
  };
}

export async function action({ context, request }: Route.ActionArgs) {
  const userId = context.get(userContext);
  if (!userId) throw redirect("/");
  const session = await getSession(request.headers.get("cookie"));
  const form = await request.formData();
  if (form.get("intent") === "requested") {
    session.set("historyRequestedBy", userId);
  } else if (form.get("intent") === "reset") {
    session.unset("historyRequestedBy");
  } else {
    throw new Response("Invalid intent", { status: 400 });
  }
  return data(null, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Import({ loaderData }: Route.ComponentProps) {
  return (
    <HistoryImport
      initialImport={loaderData.historyImport}
      requested={loaderData.requested}
    />
  );
}
