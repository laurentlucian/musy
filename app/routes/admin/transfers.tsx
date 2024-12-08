import { prisma } from "@lib/services/db.server";
import type { Route } from ".react-router/types/app/routes/admin/+types/transfers";

export async function loader({ request }: Route.LoaderArgs) {
  const transfers = await prisma.transfer.findMany();
  return { transfers };
}

export default function Transfers({ loaderData }: Route.ComponentProps) {
  return <div>Transfers</div>;
}
