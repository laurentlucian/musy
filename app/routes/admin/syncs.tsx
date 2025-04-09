import { prisma } from "@lib/services/db.server";
import type { Route } from ".react-router/types/app/routes/admin/+types/syncs";

export async function loader({ request }: Route.LoaderArgs) {
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
      {syncs.map((sync) => {
        return (
          <div
            key={`${sync.userId}-${sync.type}`}
            className="flex gap-x-2 rounded-md bg-card px-3.5 py-3 transition-colors duration-150 hover:bg-accent"
          >
            <div className="flex flex-col gap-y-2">
              <div className="flex gap-x-4">
                <div>
                  <p className="text-muted-foreground text-xs">User ID</p>
                  <p className="font-medium">{sync.userId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="font-medium capitalize">{sync.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">State</p>
                  <p className="font-medium capitalize">{sync.state}</p>
                </div>
              </div>

              <div className="flex gap-x-4">
                <div>
                  <p className="text-muted-foreground text-xs">Created</p>
                  <p className="font-medium">
                    {sync.createdAt.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Updated</p>
                  <p className="font-medium">
                    {sync.updatedAt.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {syncs.length === 0 && (
        <p className="mx-auto font-semibold text-muted-foreground text-xs">
          NONE
        </p>
      )}
    </article>
  );
}
