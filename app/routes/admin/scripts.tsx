import { Button } from "~/components/ui/button";
import { enrichAlbums } from "~/lib.server/services/scheduler/scripts/enrich-albums";
import { enrichArtists } from "~/lib.server/services/scheduler/scripts/enrich-artists";
import { logMissingData } from "~/lib.server/services/scheduler/scripts/log-missing-data";
import { syncUsers } from "~/lib.server/services/scheduler/sync";
import type { Route } from "./+types/scripts";

export default function Scripts(_: Route.ComponentProps) {
  return (
    <article className="flex flex-col gap-3 rounded-lg sm:flex-1">
      <form method="post">
        <Button type="submit" name="intent" value="sync-recent">
          Sync Recent
        </Button>
      </form>
      <form method="post">
        <Button type="submit" name="intent" value="sync-top">
          Sync Top
        </Button>
      </form>
      <form method="post">
        <Button type="submit" name="intent" value="sync-profile">
          Sync Profile
        </Button>
      </form>
      <form method="post">
        <Button type="submit" name="intent" value="sync-liked-full">
          Sync Liked (Full)
        </Button>
      </form>
      <form method="post">
        <Button type="submit" name="intent" value="enrich-artists-albums">
          Enrich Artists & Albums
        </Button>
      </form>
      <form method="post">
        <Button type="submit" name="intent" value="log-missing-data">
          Log Missing Data
        </Button>
      </form>
    </article>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "sync-recent") {
    await syncUsers("recent");
  }

  if (intent === "sync-top") {
    await syncUsers("top");
  }

  if (intent === "sync-profile") {
    await syncUsers("profile");
  }

  if (intent === "sync-liked-full") {
    await syncUsers("liked-full");
  }

  if (intent === "enrich-artists-albums") {
    await enrichArtists();
    await enrichAlbums();
  }

  if (intent === "log-missing-data") {
    await logMissingData();
  }
}
