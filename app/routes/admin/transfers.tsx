import { prisma } from "@lib/services/db.server";
import type { Route } from ".react-router/types/app/routes/admin/+types/transfers";

export async function loader({ request }: Route.LoaderArgs) {
  const transfers = await prisma.transfer.findMany();
  return { transfers };
}

export default function Transfers({
  loaderData: { transfers },
}: Route.ComponentProps) {
  return (
    <article className="flex flex-col gap-3 rounded-lg bg-card p-4 sm:flex-1">
      {transfers.map((transfer) => {
        return (
          <div
            key={`${transfer.userId}-${transfer.type}`}
            className="flex flex-1 gap-x-2 rounded-md bg-primary-foreground px-3.5 py-3 transition-colors duration-150 hover:bg-accent"
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
