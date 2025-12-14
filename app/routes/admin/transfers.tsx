import { and, eq } from "drizzle-orm";
import * as v from "valibot";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { transfer } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import type { Route } from "./+types/transfers";

export async function loader({ request }: Route.LoaderArgs) {
  const transfers = await db.select().from(transfer);
  return { transfers };
}

export default function Transfers({
  loaderData: { transfers },
}: Route.ComponentProps) {
  return (
    <article className="flex flex-col gap-3 rounded-lg sm:flex-1">
      {transfers.map((transfer) => {
        return (
          <div
            key={`${transfer.userId}-${transfer.type}`}
            className="flex gap-x-2 rounded-md bg-card p-6 transition-colors duration-150"
          >
            <div className="flex flex-col gap-y-2">
              <div className="flex gap-x-4">
                <div>
                  <p className="text-muted-foreground text-xs">User ID</p>
                  <p className="font-medium">{transfer.userId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="font-medium capitalize">{transfer.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">State</p>
                  <p className="font-medium capitalize">{transfer.state}</p>
                </div>
              </div>

              <div className="flex gap-x-4">
                <div>
                  <p className="text-muted-foreground text-xs">Created</p>
                  <p className="font-medium">
                    {transfer.createdAt.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Updated</p>
                  <p className="font-medium">
                    {transfer.updatedAt.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-x-4">
                <div>
                  <p className="text-muted-foreground text-xs">Skip</p>
                  <p className="font-medium">{transfer.skip}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total</p>
                  <p className="font-medium">{transfer.total}</p>
                </div>
              </div>

              <div className="flex gap-x-4">
                <div>
                  <p className="text-muted-foreground text-xs">Source</p>
                  <p className="font-medium capitalize">{transfer.source}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Destination</p>
                  <p className="font-medium capitalize">
                    {transfer.destination}
                  </p>
                </div>
              </div>
              <form method="post" className="mt-2 ml-auto">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="userId" value={transfer.userId} />
                <input type="hidden" name="source" value={transfer.source} />
                <input
                  type="hidden"
                  name="destination"
                  value={transfer.destination}
                />
                <input type="hidden" name="type" value={transfer.type} />
                <Button type="submit">Delete</Button>
              </form>
            </div>
          </div>
        );
      })}
      {transfers.length === 0 && (
        <p className="mx-auto font-semibold text-muted-foreground text-xs">
          NONE
        </p>
      )}
    </article>
  );
}

export async function action({ request, context }: Route.ActionArgs) {
  const _userId = context.get(userContext);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const result = v.safeParse(
      v.object({
        userId: v.string(),
        source: v.string(),
        destination: v.string(),
        type: v.string(),
      }),
      {
        userId: formData.get("userId"),
        source: formData.get("source"),
        destination: formData.get("destination"),
        type: formData.get("type"),
      },
    );

    if (!result.success) {
      return { error: "invalid transfer data" };
    }

    await db
      .delete(transfer)
      .where(
        and(
          eq(transfer.userId, result.output.userId),
          eq(transfer.source, result.output.source),
          eq(transfer.destination, result.output.destination),
          eq(transfer.type, result.output.type),
        ),
      );
  }

  return { error: null };
}
