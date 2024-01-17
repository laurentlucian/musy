import { createCookieSessionStorage } from '@remix-run/node';

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('Must set environment variable SESSION_SECRET');
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    maxAge: 2147483647, // 2038
    name: '_musy-session',
    path: '/',
    sameSite: 'lax',
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === 'production',
  },
});

export const { commitSession, destroySession, getSession } = sessionStorage;
