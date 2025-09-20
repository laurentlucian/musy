import { Authenticator } from "remix-auth";
import { getSpotifyStrategy } from "~/lib/services/auth/spotify.server";

export const authenticator = new Authenticator<{ id: string }>();

authenticator.use(getSpotifyStrategy(), "spotify");
