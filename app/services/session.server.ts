import { createCookie, createCookieSessionStorage } from '@remix-run/node';

let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('Must set environment variable SESSION_SECRET');
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_musy-session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [sessionSecret], // replace this with an actual secret from env variable
    secure: process.env.NODE_ENV === 'production', // enable this in prod only
    maxAge: 31536000, // 2024
    // maxAge: 2147483647, // 2038
  },
});

export const returnToCookie = createCookie('return-to', {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 60, // 1 minute
  secure: process.env.NODE_ENV === 'production',
});

export const { getSession, commitSession, destroySession } = sessionStorage;
