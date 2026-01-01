import { Authenticator } from "remix-auth";
import { getSpotifyStrategy } from "~/lib.server/services/auth/spotify";

export const authenticator = new Authenticator<{ id: string }>();

authenticator.use(getSpotifyStrategy(), "spotify");
