import "./globals.css";
import "./lib/fonts.css";
import "./lib/icons/waver.css";

import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { iosSplashScreens } from "./lib/utils";

const App = () => {
  return (
    <Document>
      <Outlet />
    </Document>
  );
};

export const links: LinksFunction = () => {
  return [
    {
      as: "manifest",
      href: "/manifest.json",
      rel: "manifest",
    },
    {
      href: "/apple-touch-icon.png",
      rel: "apple-touch-icon",
    },
    ...iosSplashScreens,
  ];
};

type DocumentProps = {
  children: React.ReactNode;
  title?: string;
};

const Document = ({ children, title = "musy" }: DocumentProps) => {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta charSet="utf-8" />
        <meta name="description" content="Music shared easy" />
        <meta
          name="keywords"
          content="music, discover, spotify, playlist, share, friends"
        />
        <meta property="og:description" content="Music shared easy" />
        <meta property="og:image" content="/meta-image.png" />
        <meta property="og:image:alt" content="musy" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:title" content="musy" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content="Music shared easy" />
        <meta name="twitter:image" content="/meta-image.png" />
        <meta name="twitter:title" content="musy" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,user-scalable=no"
        />
        <Meta />
        <Links />
        <title>{title}</title>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

export default App;
