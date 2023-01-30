import { createCookie, createCookieSessionStorage } from '@remix-run/node';

let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('Must set environment variable SESSION_SECRET');
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    maxAge: 31536000, // 2024
    name: '_musy-session',
    path: '/',
    sameSite: 'lax',
    secrets: [sessionSecret], // replace this with an actual secret from env variable
    secure: process.env.NODE_ENV === 'production', // enable this in prod only
    // maxAge: 2147483647, // 2038
  },
});

export const returnToCookie = createCookie('return-to', {
  httpOnly: true,
  maxAge: 60, // 1 minute
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});

export const { commitSession, destroySession, getSession } = sessionStorage;
