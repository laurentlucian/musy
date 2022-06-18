import { createCookieSessionStorage } from '@remix-run/node';

let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('Must set environment variable SESSION_SECRET');
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_sessionify',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [sessionSecret], // replace this with an actual secret from env variable
    secure: process.env.NODE_ENV === 'production', // enable this in prod only
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
