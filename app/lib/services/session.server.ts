import {
  createCookieSessionStorage,
  type Session,
  type SessionIdStorageStrategy,
} from "react-router";
import { env } from "~/lib/env.server";

export const cookieOptions = {
  httpOnly: true,
  maxAge: 2147483647, // 2038
  name: "_musy-session",
  path: "/",
  sameSite: "lax",
  secrets: [env.SESSION_SECRET],
  secure: env.NODE_ENV === "production",
} satisfies SessionIdStorageStrategy["cookie"];

export type SessionData = {
  data: { id: string };
  "spotify:session": {
    // legacy
    accessToken: string;
    expiresAt: number;
    refreshToken: string;
    tokenType: string;
    user: {
      email: string;
      id: string;
      image: string;
      name: string;
    };
  };
};

export type SessionTyped = Session<SessionData>;

export const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: cookieOptions,
});

export const { commitSession, destroySession, getSession } = sessionStorage;
