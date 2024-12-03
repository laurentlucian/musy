import {
  type SessionIdStorageStrategy,
  createCookieSessionStorage,
} from "react-router";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret)
  throw new Error("Must set environment variable SESSION_SECRET");

export const cookieOptions = {
  httpOnly: true,
  maxAge: 2147483647, // 2038
  name: "_musy-session",
  path: "/",
  sameSite: "lax",
  secrets: [sessionSecret],
  secure: process.env.NODE_ENV === "production",
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

export const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: cookieOptions,
});

export const { commitSession, destroySession, getSession } = sessionStorage;
