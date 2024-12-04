import type { GoogleService } from "../google.server";

async function search(service: GoogleService, query: string) {
  const { youtube } = service.getClient();

  const response = await youtube.search.list({
    part: ["snippet"],
    q: query,
    type: ["video"],
    videoCategoryId: "10", // Music category
    maxResults: 10,
  });

  return (
    response.data.items?.map((item) => ({
      videoId: item.id?.videoId || "",
      title: item.snippet?.title || "",
      artists: [
        {
          name: item.snippet?.channelTitle || "",
          id: item.snippet?.channelId,
        },
      ],
      duration: "",
      thumbnails: (item.snippet?.thumbnails
        ? Object.values(item.snippet.thumbnails)
        : []
      ).map((thumb) => ({
        url: thumb?.url || "",
        width: thumb?.width || 0,
        height: thumb?.height || 0,
      })),
    })) || []
  );
}

async function addToLibrary(service: GoogleService, videoId: string) {
  const { youtube } = service.getClient();

  return youtube.videos.rate({
    id: videoId,
    rating: "like",
  });
}

async function createPlaylist(
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

export const youtube = {
  search,
  addToLibrary,
  createPlaylist,
};
