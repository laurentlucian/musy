import { askGroq } from "@lib/services/ai/groq";
import type { RecentSongs } from "@prisma/client";

export async function getAnalysis(track: SpotifyApi.SingleTrackResponse) {
  const {
    artists: [{ name: artist }],
    name,
  } = track;
  const prompt = `Elaborate on songwriting, vocal, instrumental, production, bpm, genre, chords, and mixing detail for ${artist}'s ${name}`;

  return askGroq(prompt);
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

  const response = (await askGroq(prompt)).split(".")[0];
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

  const response = (await askGroq(prompt)).split(".")[0];
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

  return askGroq(prompt);
}
