import type { GoogleService } from "../sdk/google.server";

export async function createPlaylist(
  service: GoogleService,
  title: string,
  description = "",
  privacyStatus: "private" | "public" | "unlisted" = "private",
) {
  const { youtube } = service.getClient();
  const response = await youtube.playlists.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description,
      },
      status: {
        privacyStatus,
      },
    },
  });

  return response.data;
}
