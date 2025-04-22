import { type RecentSongs, prisma } from "@lib/services/db.server";
import { askAI } from "@lib/services/sdk/ai.server";
import { askAITaste } from "@lib/services/sdk/helpers/ai/taste.server";
import { askAITracks } from "@lib/services/sdk/helpers/ai/track.server";
import { getTrackFromSpotify } from "@lib/services/sdk/helpers/spotify.server";

export async function getAnalysis(track: SpotifyApi.SingleTrackResponse) {
  const {
    artists: [{ name: artist }],
    name,
  } = track;
  const prompt = `Elaborate on songwriting, vocal, instrumental, production, bpm, genre, chords, and mixing detail for ${artist}'s ${name}`;

  return askAI(prompt);
}

export async function getMoodFromSpotify(
  recent: SpotifyApi.UsersRecentlyPlayedTracksResponse,
) {
  const tracks = recent.items.map((item) => ({
    album_name: item.track.album.name,
    artist_name: item.track.artists[0].name,
    song_name: item.track.name,
  }));

  const prompt = `Based on the songs given below, describe my current mood in one word. Choose fun and uncommon words. 
    ${JSON.stringify(tracks)}`;

  const response = (await askAI(prompt)).split(".")[0];
  return response;
}
export async function getMoodFromPrisma(
  recent: (RecentSongs & {
    track: {
      albumName: string;
      artist: string;
      name: string;
    };
  })[],
) {
  const tracks = recent.map((item) => ({
    album_name: item.track.albumName,
    artist_name: item.track.artist,
    song_name: item.track.name,
  }));

  const prompt = `Based on the songs given below, describe my current mood in one word. Choose fun and uncommon words. 
    ${JSON.stringify(tracks)}`;

  const response = (await askAI(prompt)).split(".")[0];
  return response;
}

export async function getStory(track: SpotifyApi.SingleTrackResponse) {
  const {
    artists: [{ name: artist }],
    name,
  } = track;

  const prompt = `Based on the song ${name} by ${artist}, craft me a scenario. The scenario should be atmospheric, vivid, and transport the reader to a specific place and vibe. 
    Encourage ChatGPT to use descriptive language to help the reader imagine the setting, and to touch on the song's songwriting, vocal, instrumental, bpm, and genre in a way that enhances the environment.
    `;

  return askAI(prompt);
}

async function getTasteFromUser(userId: string) {
  const existing = await prisma.aI.findUnique({
    where: { userId },
  });

  if (existing?.taste) {
    return existing.taste;
  }

  const recents = await prisma.recentSongs.findMany({
    where: { userId },
    include: {
      track: true,
    },
    orderBy: {
      playedAt: "desc",
    },
    take: 20,
  });

  const liked = await prisma.likedSongs.findMany({
    where: { userId },
    include: {
      track: true,
    },
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
  });

  const tracks = [...recents, ...liked].map((item) => ({
    name: item.track.name,
    artist: item.track.artist,
  }));

  const prompt = `Based on these 20 songs, create a concise taste profile that captures the user's musical preferences. Focus on genres, moods, and sonic characteristics. Make it consumable by an LLM. Keep it natural and descriptive:
    ${JSON.stringify(tracks.join("\n"))}`;

  const taste = await askAITaste(prompt);
  console.info("taste", taste);

  await prisma.aI.upsert({
    where: { userId },
    update: { taste: JSON.stringify(taste) },
    create: { userId, taste: JSON.stringify(taste) },
  });

  return JSON.stringify(taste);
}

export async function getTracksFromMood(mood: string, userId: string) {
  const taste = await getTasteFromUser(userId);

  const prompt = `Based on your taste profile ('${taste}') and your current mood ${mood} (EMPHASIS ON THE MOOD), here are 10 track recommendations:`;
  const result = await askAITracks(prompt);
  console.info("result", result);

  const promises = result.map(async (track) => {
    const exists = await prisma.track.findFirst({
      where: {
        name: track.name,
        artist: track.artist,
      },
    });

    if (exists) {
      return exists;
    }

    const created = await getTrackFromSpotify(
      `${track.name} ${track.artist}`,
      userId,
    );

    return created;
  });

  const tracks = await Promise.all(promises);

  return tracks;
}
