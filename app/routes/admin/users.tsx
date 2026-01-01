import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { ClipboardCopy, TrashIcon } from "lucide-react";
import { data, useNavigation, useSubmit } from "react-router";
import { toast } from "sonner";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { profile, provider } from "~/lib.server/db/schema";
import { ADMIN_USER_ID, DEV } from "~/lib.server/services/auth/const";
import { db } from "~/lib.server/services/db";
import { deleteUser } from "~/lib.server/services/db/users";
import type { Route } from "./+types/users";

export async function loader(_: Route.LoaderArgs) {
  const users = await db
    .select({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      userId: profile.id, // profile.id is the foreign key to user
      providers: {
        revoked: provider.revoked,
      },
    })
    .from(profile)
    .leftJoin(provider, eq(profile.id, provider.userId))
    .orderBy(desc(profile.updatedAt));

  // Group providers by user to match the Prisma structure
  const groupedUsers = users.reduce((acc, user) => {
    const existing = acc.find((u) => u.id === user.id);
    if (existing) {
      if (user.providers?.revoked !== null) {
        existing.user.providers.push(user.providers);
      }
    } else {
      acc.push({
        ...user,
        user: {
          providers: user.providers?.revoked !== null ? [user.providers] : [],
        },
      });
    }
    return acc;
  }, [] as any[]);

  return { users: groupedUsers };
}

export default function Users({ loaderData: { users } }: Route.ComponentProps) {
  const navigation = useNavigation();
  const userId = navigation.formData?.get("userId");
  const submit = useSubmit();

  return (
    <article className="flex flex-col gap-3 font-normal text-sm sm:flex-1">
      <table className="w-full whitespace-nowrap rounded-lg">
        <thead>
          <tr className="text-left text-muted-foreground text-xs *:p-3">
            <th>Name</th>
            <th>Email</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Revoked</th>
          </tr>
        </thead>
        <tbody>
          {users.map((profile) => {
            const provider = profile.user.providers[0];
            const revoked = !provider || provider?.revoked === "1";
            return (
              <tr
                key={profile.id}
                className="bg-card transition-colors duration-150 *:p-3"
              >
                <td className="capitalize">{profile.name}</td>
                <td>{profile.email}</td>
                <td>{format(profile.createdAt, "MMM d y")}</td>
                <td>{format(profile.updatedAt, "MMM d h:m a")}</td>
                <td>{revoked ? "Yes" : "No"}</td>
                <td className="flex items-center gap-2">
                  <Button
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(profile.id);
                      toast.success("Copied");
                    }}
                  >
                    <ClipboardCopy />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={userId === profile.id}
                    onClick={() => {
                      void submit({ userId: profile.id }, { method: "post" });
                    }}
                  >
                    {userId === profile.id ? <Waver /> : <TrashIcon />}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="mx-auto font-semibold text-muted-foreground text-xs">
          NONE
        </p>
      )}
    </article>
  );
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const userId = formData.get("userId");
  if (typeof userId !== "string")
    return data("User ID required", { status: 400 });

  if (context.get(userContext) !== ADMIN_USER_ID && !DEV)
    return data("unauthorized", { status: 401 });

  await deleteUser(userId);
}
