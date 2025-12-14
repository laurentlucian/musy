import { format } from "date-fns";
import { desc } from "drizzle-orm";
import { href, useNavigate, useNavigation, useSubmit } from "react-router";
import { Button } from "~/components/ui/button";
import { sync } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import type { Route } from "./+types/syncs";

export async function loader(_: Route.LoaderArgs) {
  const syncs = await db.select().from(sync).orderBy(desc(sync.updatedAt));
  return { syncs };
}

export default function Syncs({ loaderData: { syncs } }: Route.ComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const navigate = useNavigate();
  return (
    <article className="flex flex-col gap-3 sm:flex-1">
      <div className="overflow-y-hidden">
        <table className="min-w-max rounded-lg">
          <thead>
            <tr className="text-left text-muted-foreground text-xs *:p-3">
              <th>User ID</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Type</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {syncs.map((sync) => (
              <tr
                key={`${sync.userId}-${sync.type}`}
                className="bg-card transition-colors duration-150 *:p-3 hover:bg-accent"
                onClick={() => {
                  navigate(
                    href("/profile/:userId?", {
                      userId: sync.userId,
                    }),
                  );
                }}
              >
                <td className="text-sm">{sync.userId}</td>
                <td className="">{format(sync.createdAt, "MMM d")}</td>
                <td className="">{format(sync.updatedAt, "MMM d h:m a")}</td>
                <td className="capitalize">{sync.type}</td>
                <td className="capitalize">{sync.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {syncs.length === 0 && (
        <p className="mx-auto font-semibold text-muted-foreground text-xs">
          NONE
        </p>
      )}
      {syncs.length > 0 && (
        <Button
          className="w-fit"
          name="intent"
          value="clear"
          disabled={navigation.formData?.get("intent") === "clear"}
          onClick={() => {
            submit({ intent: "clear" }, { method: "post" });
          }}
        >
          {navigation.formData?.get("intent") === "clear"
            ? "Clearing..."
            : "Clear"}
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
