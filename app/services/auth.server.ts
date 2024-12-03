import { Authenticator } from "remix-auth";
import { getGoogleStrategy } from "./auth/google.server";
import { getSpotifyStrategy } from "./auth/spotify.server";

export const authenticator = new Authenticator<{ id: string }>();

authenticator.use(getSpotifyStrategy(), "spotify");
authenticator.use(getGoogleStrategy(), "google");
