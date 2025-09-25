import { format } from "date-fns";
import { ClipboardCopy, TrashIcon } from "lucide-react";
import { data, useNavigation, useSubmit } from "react-router";
import { toast } from "sonner";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { ADMIN_USER_ID, DEV } from "~/lib/services/auth/const";
import { deleteUser } from "~/lib/services/db/users.server";
import { prisma } from "~/lib/services/db.server";
import type { Route } from "./+types/users";

export async function loader(_: Route.LoaderArgs) {
  const users = await prisma.profile.findMany({
    include: {
      user: {
        select: {
          providers: {
            select: {
              revoked: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return { users };
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
            const revoked = !provider || provider?.revoked;
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
                      submit({ userId: profile.id }, { method: "post" });
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
