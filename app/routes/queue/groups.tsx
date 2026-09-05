import type { Route } from ".react-router/types/app/routes/queue/+types/groups";
import { ArrowUpRight, Plus, Users } from "lucide-react";
import {
  Form,
  Link,
  Outlet,
  redirect,
  useNavigation,
  useOutlet,
} from "react-router";
import { Button } from "~/components/ui/button";

import { userContext } from "~/context";
import {
  createQueueGroup,
  getUserQueueGroups,
} from "~/lib.server/services/db/queue";
import { Loader } from "~/routes/profile/utils/profile.utils";

export async function loader({ context }: Route.LoaderArgs) {
  const userId = context.get(userContext);

  if (!userId) throw redirect("/");

  const groups = await getUserQueueGroups(userId);

  return {
    userId,
    groups,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const userId = context.get(userContext);
  if (!userId) throw redirect("/");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create-group") {
    await createQueueGroup(userId);
    return { success: true };
  }

  return null;
}

export default function Groups({ loaderData }: Route.ComponentProps) {
  const outlet = useOutlet();

  if (outlet) return <Outlet />;

  return (
    <section className="mx-auto w-full max-w-5xl py-4">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-4">
        <div>
          <h1 className="font-semibold text-2xl sm:text-3xl">Shared queues</h1>
        </div>
        <CreateGroupButton>
          <Plus className="size-4" /> New queue
        </CreateGroupButton>
      </header>
      {loaderData.groups.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Users className="mb-6 size-10 text-primary" strokeWidth={1} />
          <h2 className="font-semibold text-3xl">No queues yet</h2>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {loaderData.groups.map((group, index) => (
            <Link
              to={`/queue/${group.id}`}
              key={group.id}
              className="group flex items-center gap-5 py-4 transition-colors hover:text-primary"
            >
              <span className="font-semibold text-2xl text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-3xl">{group.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {group.members.length === 0
                    ? "Invite friends to join"
                    : `${group.members.length} member${group.members.length > 1 ? "s" : ""}`}
                </p>
              </div>
              <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function CreateGroupButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const navigation = useNavigation();
  const isCreating = navigation.formData?.get("intent") === "create-group";

  return (
    <Form method="post">
      <Button
        name="intent"
        value="create-group"
        disabled={isCreating}
        {...props}
      >
        {isCreating ? (
          <>
            <Loader /> Creating…
          </>
        ) : (
          children
        )}
      </Button>
    </Form>
  );
}
