import {
  createCookieSessionStorage,
  type Session,
  type SessionIdStorageStrategy,
} from "react-router";

export const cookieOptions = {
  httpOnly: true,
  maxAge: 2147483647, // 2038
  name: "_musy-session",
  path: "/",
  sameSite: "lax",
  secrets: ["d00cd8153c10e47afa1b7a8f41b3dbc2"],
  secure: !import.meta.env.DEV,
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
