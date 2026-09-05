import type { Route } from ".react-router/types/app/routes/queue/+types/groups";
import { ChevronRight, Plus, Users } from "lucide-react";
import {
  Form,
  Link,
  Outlet,
  redirect,
  useNavigation,
  useOutlet,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Image } from "~/components/ui/image";

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
    const id = await createQueueGroup(userId);
    throw redirect(`/queue/${id}`);
  }

  return null;
}

export default function Groups({ loaderData }: Route.ComponentProps) {
  const outlet = useOutlet();

  if (outlet) return <Outlet />;

  const { groups, userId } = loaderData;

  return (
    <section
      aria-labelledby="queues-title"
      className="pb-8"
    >
      <header className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1
            id="queues-title"
            className="font-semibold text-2xl tracking-tight sm:text-3xl"
          >
            Shared queues
          </h1>
          {groups.length > 0 && (
            <p className="mt-1 text-muted-foreground text-sm">
              {groups.length} {groups.length === 1 ? "queue" : "queues"}
            </p>
          )}
        </div>
        <CreateGroupButton>
          <Plus /> New queue
        </CreateGroupButton>
      </header>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-border border-dashed px-6 py-20 text-center">
          <Users
            className="mb-4 size-8 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <h2 className="font-semibold text-lg">No queues yet</h2>
          <p className="mt-1 max-w-xs text-muted-foreground text-sm">
            Queue tracks together with friends in real time.
          </p>
          <CreateGroupButton className="mt-6" variant="outline">
            <Plus /> Create queue
          </CreateGroupButton>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {groups.map((group) => {
            const people = [
              group.owner,
              ...group.members
                .filter((m) => m.userId !== group.userId)
                .map((m) => m.user),
            ];
            const isOwner = group.userId === userId;

            return (
              <li key={group.id}>
                <Link
                  to={`/queue/${group.id}`}
                  aria-label={`${group.name ?? "Queue"}, ${people.length} ${people.length === 1 ? "member" : "members"}`}
                  className="group flex items-center gap-4 px-4 py-4 outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset sm:px-5"
                >
                  <AvatarStack people={people} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-base">
                      {group.name ?? "Queue"}
                    </h2>
                    <p className="mt-0.5 truncate text-muted-foreground text-sm">
                      {isOwner ? "Yours" : `${group.owner.name ?? "Someone"}'s`}
                      {" · "}
                      {people.length === 1
                        ? "Invite friends"
                        : `${people.length} members`}
                    </p>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function AvatarStack({
  people,
}: {
  people: { id: string; name: string | null; image: string | null }[];
}) {
  const shown = people.slice(0, 3);
  const rest = people.length - shown.length;

  return (
    <div className="flex shrink-0 -space-x-2" aria-hidden>
      {shown.map((person) => (
        <Image
          key={person.id}
          src={person.image ?? ""}
          alt=""
          name={person.name}
          width={32}
          height={32}
          className="size-8 rounded-full object-cover ring-2 ring-card"
        />
      ))}
      {rest > 0 && (
        <span className="flex size-8 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-xs ring-2 ring-card">
          +{rest}
        </span>
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
