import { migrateUserIds } from "@lib/services/scripts/migrate-user-ids";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/scripts";

export default function Scripts(_: Route.ComponentProps) {
  return (
    <article className="flex flex-col gap-3 rounded-lg sm:flex-1">
      <form method="post">
        <Button type="submit" name="intent" value="migrate-users">
          Migrate User IDs
        </Button>
      </form>
    </article>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "migrate-users") {
    await migrateUserIds();
  }
}
