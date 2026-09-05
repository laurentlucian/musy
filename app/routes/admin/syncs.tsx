import { format } from "date-fns";
import { desc } from "drizzle-orm";
import { href, Link, useNavigation, useSubmit } from "react-router";
import { Button } from "~/components/ui/button";
import { sync } from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";
import type { Route } from "./+types/syncs";

export async function loader(_: Route.LoaderArgs) {
  const syncs = await db.select().from(sync).orderBy(desc(sync.updatedAt));
  return { syncs };
}

export default function Syncs({ loaderData: { syncs } }: Route.ComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  return (
    <article className="flex min-w-0 flex-col gap-5 text-sm">
      <h2 className="font-semibold text-3xl">Sync activity</h2>
      <div className="overflow-y-hidden">
        <table className="min-w-max rounded-lg">
          <thead>
            <tr className="text-left text-muted-foreground text-xs">
              <th className="p-3">User ID</th>
              <th className="p-3">Created</th>
              <th className="p-3">Updated</th>
              <th className="p-3">Type</th>
              <th className="p-3">State</th>
            </tr>
          </thead>
          <tbody>
            {syncs.map((sync) => (
              <tr
                key={`${sync.userId}-${sync.type}`}
                className="border-b border-border transition-colors duration-150 hover:bg-accent"
              >
                <td className="p-3 font-mono text-xs">
                  <Link
                    className="hover:text-primary hover:underline"
                    to={href("/profile/:userId?", { userId: sync.userId })}
                  >
                    {sync.userId}
                  </Link>
                </td>
                <td className="p-3 font-mono text-xs">
                  {format(sync.createdAt, "MMM d")}
                </td>
                <td className="p-3 font-mono text-xs">
                  {format(sync.updatedAt, "MMM d h:mm a")}
                </td>
                <td className="p-3 capitalize">{sync.type}</td>
                <td className="p-3 capitalize">{sync.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {syncs.length === 0 && (
        <p className="mx-auto font-semibold text-muted-foreground text-xs">
          Nothing here yet.
        </p>
      )}
      {syncs.length > 0 && (
        <Button
          className="w-fit"
          name="intent"
          value="clear"
          disabled={navigation.formData?.get("intent") === "clear"}
          onClick={() => {
            void submit({ intent: "clear" }, { method: "post" });
          }}
        >
          {navigation.formData?.get("intent") === "clear"
            ? "Clearing..."
            : "Clear sync history"}
        </Button>
      )}
    </article>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "clear") {
    await db.delete(sync);
  }
}
