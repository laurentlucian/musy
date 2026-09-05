import { Form, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { logMissingData } from "~/lib.server/services/scheduler/scripts/log-missing-data";
import { syncUsers } from "~/lib.server/services/scheduler/sync";
import type { Route } from "./+types/scripts";

export default function Scripts(_: Route.ComponentProps) {
  const navigation = useNavigation();
  return (
    <article>
      <h2 className="mb-3 font-semibold text-3xl">Maintenance</h2>
      <p className="mb-8 text-sm text-muted-foreground">
        Refresh listening data across accounts.
      </p>
      <div className="divide-y divide-border border-y border-border">
        {[
          ["sync-recent", "Recent listening"],
          ["sync-top", "Top music"],
          ["sync-profile", "Profiles"],
          ["sync-liked-full", "Liked tracks"],
          ["log-missing-data", "Find missing data"],
        ].map(([intent, label]) => (
          <Form
            key={intent}
            method="post"
            className="flex items-center justify-between gap-4 py-5"
          >
            <span>{label}</span>
            <Button
              variant="outline"
              type="submit"
              name="intent"
              value={intent}
              disabled={navigation.state !== "idle"}
            >
              {navigation.formData?.get("intent") === intent
                ? "Running…"
                : intent === "log-missing-data"
                  ? "Inspect"
                  : "Refresh"}
            </Button>
          </Form>
        ))}
      </div>
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

  if (intent === "log-missing-data") {
    await logMissingData();
  }
}
