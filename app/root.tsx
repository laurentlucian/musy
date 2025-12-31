import type { Route } from ".react-router/types/app/+types/root";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Toaster } from "~/components/ui/sonner";
import { userContext } from "~/context";
import stylesheet from "~/globals.css?url";
import { ADMIN_USER_ID, DEV } from "~/lib/services/auth/const";
import { sessionStorage } from "~/lib/services/session.server";
import { log } from "~/lib/utils";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", type: "image/x-icon", href: "/logo/musy.png" },
  { rel: "icon", type: "image/png", href: "/logo/musy.png" },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "apple-touch-icon", href: "/logo/musy.png" },
];

export const meta: MetaFunction = () => [
  { title: "musy" },
  { name: "description", content: "" },
  {
    name: "viewport",
    content: "width=device-width, initial-scale=1, viewport-fit=cover",
  },
  { name: "mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-capable", content: "yes" },
  { name: "apple-touch-fullscreen", content: "yes" },
  {
    name: "apple-mobile-web-app-status-bar-style",
    content: "black-translucent",
  },
];

export const middleware: Route.MiddlewareFunction[] = [
  async ({ request, context }) => {
    const headers = request.headers;
    const session = await sessionStorage.getSession(headers.get("cookie"));
    const user = session.get("data");

    if (user) {
      context.set(userContext, user.id);
    }
  },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs & { context: { userId?: string } }) {
  const url = new URL(request.url);
  const accessingAdmin = url.pathname.includes("/admin");
  if (accessingAdmin && !DEV) {
    const userId = context.get(userContext);
    if (userId !== ADMIN_USER_ID) {
      throw redirect("/");
    }
  }
  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background text-foreground">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "unexpected error";
  let details = "";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "page not found" : error.status.toString();
    log(message, "error");
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.name;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16 text-center">
      <h1>{message}</h1>
      <p className="mt-2 text-muted-foreground">{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4 text-muted-foreground text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
