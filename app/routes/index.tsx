import { Form, redirect } from "react-router";
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
  const { error, code } = loaderData;

  return (
    <main className="flex min-h-dvh w-full max-w-dvw flex-1 flex-col items-center justify-center gap-4 px-8">
      {error && (
        <div className="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
          <p className="font-medium text-xs">{error}</p>
          {code && <p className="mt-1 text-red-600 text-xs">Code: {code}</p>}
        </div>
      )}
      <Form method="post" className="w-full max-w-sm">
        <input type="hidden" name="mode" value="authorize" />
        <input type="hidden" name="provider" value="spotify" />
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#1DB954] px-6 py-3 font-semibold text-white transition-all hover:bg-[#1ed760]"
        >
          <img
            src="/spotify/icon-white.png"
            alt="Spotify"
            className="h-5 w-5"
          />
          <span>Continue with Spotify</span>
        </button>
      </Form>
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
