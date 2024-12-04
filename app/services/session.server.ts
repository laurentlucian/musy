import {
  type Session,
  type SessionIdStorageStrategy,
  createCookieSessionStorage,
} from "react-router";
import invariant from "tiny-invariant";

const sessionSecret = process.env.SESSION_SECRET;
invariant(sessionSecret, "Missing SESSION_SECRET env");

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

export type SessionTyped = Session<SessionData>;

export const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: cookieOptions,
});

export const { commitSession, destroySession, getSession } = sessionStorage;
