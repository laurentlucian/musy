import type { GoogleClients } from "@lib/services/sdk/google.server";

async function search(youtube: GoogleClients["youtube"], query: string) {
  const response = await youtube.search.list({
    part: ["snippet"],
    q: query,
    type: ["video"],
    videoCategoryId: "10", // music
    maxResults: 1,
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

async function addToLibrary(
  youtube: GoogleClients["youtube"],
  videoId: string,
) {
  return youtube.videos.rate({
    id: videoId,
    rating: "like",
  });
}

async function getPlaylists(youtube: GoogleClients["youtube"]) {
  const response = await youtube.playlists.list({
    part: ["snippet", "contentDetails"],
    mine: true,
    maxResults: 50,
  });

  return response.data.items;
}

async function createPlaylist(
  youtube: GoogleClients["youtube"],
  title: string,
  description = "",
  privacyStatus: "private" | "public" | "unlisted" = "private",
) {
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

async function addToPlaylist(
  youtube: GoogleClients["youtube"],
  playlistId: string,
  videoId: string,
) {
  const response = await youtube.playlistItems.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        playlistId,
        resourceId: {
          kind: "youtube#video",
          videoId,
        },
      },
    },
  });

  return response.data;
}

export const youtube = {
  search,
  addToLibrary,
  getPlaylists,
  createPlaylist,
  addToPlaylist,
};
