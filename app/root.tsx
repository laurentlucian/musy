import { ADMIN_USER_ID, DEV } from "@lib/services/auth/const";
import { log } from "@lib/utils";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import { Toaster } from "./components/ui/sonner";
import stylesheet from "./globals.css?url";

export function links() {
  return [
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
    { rel: "apple-touch-icon", href: "/logo/musy.png" },
  ] as Route.LinkDescriptors;
}

export function meta() {
  return [
    { title: "musy" },
    { name: "description", content: "music sharing" },
  ] as Route.MetaDescriptors;
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const accessingAdmin = url.pathname.includes("/admin");
  if (accessingAdmin && !DEV) {
    const userId = context.userId;
    if (userId !== ADMIN_USER_ID) {
      throw redirect("/");
    }
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="flex bg-background">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-1">
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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
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
