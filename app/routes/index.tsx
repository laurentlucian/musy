import { useEffect } from "react";
import { Form, redirect } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { authenticator } from "~/lib.server/services/auth";
import type { Route } from "./+types/index";

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

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-8 text-foreground">
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <h1 className="text-4xl font-semibold tracking-tight">musy</h1>
        <Form method="post" className="mt-8">
          <input type="hidden" name="mode" value="authorize" />
          <input type="hidden" name="provider" value="spotify" />
          <Button type="submit" size="lg" className="gap-3">
            <img
              src="/spotify/icon-black.png"
              alt=""
              className="h-5 w-5"
            />
            Continue with Spotify
          </Button>
        </Form>
      </div>
    </main>
  );
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
