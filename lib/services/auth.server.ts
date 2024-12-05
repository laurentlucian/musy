import { getGoogleStrategy } from "@lib/services/auth/google.server";
import { getSpotifyStrategy } from "@lib/services/auth/spotify.server";
import { Authenticator } from "remix-auth";

export const authenticator = new Authenticator<{ id: string }>();

authenticator.use(getSpotifyStrategy(), "spotify");
authenticator.use(getGoogleStrategy(), "google");
