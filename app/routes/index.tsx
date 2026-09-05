import { useEffect } from "react";
import { redirect } from "react-router";
import { toast } from "sonner";
import { Landing, landingMeta } from "~/components/landing/landing";
import { userContext } from "~/context";
import { authenticator } from "~/lib.server/services/auth";
import type { Route } from "./+types/index";

export const meta = landingMeta;

export async function loader({ context, request }: Route.LoaderArgs) {
  const userId = context.get(userContext);

  if (userId) {
    throw redirect("/profile");
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");

  return { error, code };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { error } = loaderData;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return <Landing />;
}

export async function action({ request }: Route.ActionArgs) {
  const cloned = request.clone();
  const data = await request.formData();
  const mode = data.get("mode");
  if (typeof mode !== "string") throw new Error("mode not found");

  if (mode === "authorize") {
    const provider = data.get("provider");
    if (typeof provider !== "string") throw new Error("invalid data");
    await authenticator.authenticate(provider, cloned as Request);
  }
}
