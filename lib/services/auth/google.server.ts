import { prisma } from "@lib/services/db.server";
import { getGoogleClientsFromCredentials } from "@lib/services/sdk/google.server";
import { OAuth2Strategy } from "remix-auth-oauth2";
import invariant from "tiny-invariant";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectURI = process.env.GOOGLE_CALLBACK_URL;

export function getGoogleStrategy() {
  if (!clientId || !clientSecret || !redirectURI)
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set");

  return new OAuth2Strategy(
    {
      clientId,
      clientSecret,
      redirectURI,
      authorizationEndpoint:
        "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      scopes,
      cookie: "google:session",
    },
    async ({ tokens }) => {
      const { oauth } = getGoogleClientsFromCredentials({
        access_token: tokens.accessToken(),
        refresh_token: tokens.refreshToken(),
        expiry_date: tokens.accessTokenExpiresAt()?.getTime(),
        id_token: tokens.idToken(),
        scope: tokens.scopes().join(", "),
        token_type: tokens.tokenType(),
      });

      const { data } = await oauth.userinfo.get();

      invariant(data.id, "missing google profile");
      const user = await prisma.provider.findFirst({
        where: {
          accountId: data.id,
          type: "google",
        },
      });

      if (user) {
        await prisma.provider.update({
          data: {
            accessToken: tokens.accessToken(),
            refreshToken: tokens.refreshToken(),
            expiresAt: BigInt(
              Date.now() + tokens.accessTokenExpiresInSeconds() * 1000,
            ),
            tokenType: tokens.tokenType(),
          },
          where: { id: user.id, type: "google" },
        });

        return { id: user.userId };
      }

      invariant(data.email, "missing google email");
      let profile = await prisma.profile.findFirst({
        where: { email: data.email },
        select: { user: { select: { id: true } } },
      });

      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            email: data.email,
            name: data.name,
            image: data.picture,
            user: {
              create: {},
            },
          },
          select: { user: { select: { id: true } } },
        });
      }

      await prisma.provider.create({
        data: {
          type: "google",
          accountId: data.id,
          accessToken: tokens.accessToken(),
          refreshToken: tokens.refreshToken(),
          expiresAt: BigInt(
            Date.now() + tokens.accessTokenExpiresInSeconds() * 1000,
          ),
          tokenType: tokens.tokenType(),
          user: {
            connect: {
              id: profile.user.id,
            },
          },
        },
      });

      return { id: profile.user.id };
    },
  );
}

// https://developers.google.com/identity/protocols/oauth2/scopes
const scopes = [
  "openid", // required for getting user's ID
  "email", // get user's email address
  "profile", // get user's basic profile info (name, profile picture)
  "https://www.googleapis.com/auth/youtube", // full access to YouTube account
];
