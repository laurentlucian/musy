import type { Route } from ".react-router/types/app/routes/queue/+types/groups";
import { Plus, Users } from "lucide-react";
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
    <div className="flex w-full flex-col gap-6 p-6">
      <CreateGroupButton variant="outline" size="icon">
        <Plus />
      </CreateGroupButton>

      {loaderData.groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Users className="mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="font-semibold text-lg">No groups yet</h3>
          <p className="mb-4 text-muted-foreground text-sm">
            Create a group to start queuing songs with friends.
          </p>
          <CreateGroupButton>Create Group</CreateGroupButton>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-2">
          {loaderData.groups.map((group) => (
            <Link
              to={`/queue/${group.id}`}
              key={group.id}
              className="cursor-pointer rounded-xl bg-card text-card-foreground shadow transition-colors hover:bg-accent/50 hover:ring-2 hover:ring-secondary"
            >
              <div className="flex flex-col gap-2 p-6">
                <h3 className="font-semibold leading-none tracking-tight">
                  {group.name}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {group.members.length === 0
                    ? "Share link to add others."
                    : `${group.members.length} member${
                        group.members.length > 1 ? "s" : ""
                      }`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
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
        {isCreating ? <Loader /> : children}
      </Button>
    </Form>
  );
}
