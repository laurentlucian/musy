import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { TrashIcon } from "lucide-react";
import { data, Link, useNavigation, useSubmit } from "react-router";
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
    <article className="flex min-w-0 flex-col gap-5 overflow-x-auto text-sm">
      <h2 className="font-semibold text-3xl">People</h2>
      <table className="w-full whitespace-nowrap rounded-lg">
        <thead>
          <tr className="text-left text-muted-foreground text-xs">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Created</th>
            <th className="p-3">Updated</th>
            <th className="p-3">Revoked</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((profile) => {
            const provider = profile.user.providers[0];
            const revoked = !provider || provider?.revoked === "1";
            return (
              <tr
                key={profile.id}
                className="border-b border-border transition-colors duration-150 hover:bg-muted"
              >
                <td className="p-3 capitalize">
                  <Link
                    className="hover:text-primary hover:underline"
                    to={`/profile/${profile.id}`}
                  >
                    {profile.name || "View profile"}
                  </Link>
                </td>
                <td className="p-3">{profile.email}</td>
                <td className="p-3 font-mono text-xs">
                  {format(profile.createdAt, "MMM d y")}
                </td>
                <td className="p-3 font-mono text-xs">
                  {format(profile.updatedAt, "MMM d h:mm a")}
                </td>
                <td className="p-3">{revoked ? "Yes" : "No"}</td>
                <td className="p-3">
                  <Button
                    aria-label={`Delete ${profile.name ?? "user"}`}
                    variant="ghost"
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
          Nothing here yet.
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
