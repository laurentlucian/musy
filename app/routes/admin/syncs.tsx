import { prisma } from "@lib/services/db.server";
import { format } from "date-fns";
import type { Route } from "./+types/syncs";

export async function loader(_: Route.LoaderArgs) {
  const syncs = await prisma.sync.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });
  return { syncs };
}

export default function Syncs({ loaderData: { syncs } }: Route.ComponentProps) {
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
    </article>
  );
}
