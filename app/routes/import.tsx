import { redirect } from "react-router";
import { HistoryImport } from "~/components/domain/history-import";
import { userContext } from "~/context";
import { getHistoryImport } from "~/lib.server/services/history-import";
import type { Route } from "./+types/import";

export async function loader({ context }: Route.LoaderArgs) {
  const userId = context.get(userContext);
  if (!userId) throw redirect("/");
  return { historyImport: await getHistoryImport(userId) };
}

export default function Import({ loaderData }: Route.ComponentProps) {
  return <HistoryImport initialImport={loaderData.historyImport} />;
}
