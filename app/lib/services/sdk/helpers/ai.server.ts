import { prisma } from "~/lib/services/db.server";
import { askAITaste } from "~/lib/services/sdk/helpers/ai/taste.server";
import { askAITracks } from "~/lib/services/sdk/helpers/ai/track.server";
import { getTrackFromSpotify } from "~/lib/services/sdk/helpers/spotify.server";
import { generateId } from "~/lib/utils.server";

async function _getTasteFromUser(userId: string) {
  const existing = await prisma.generated.findUnique({
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

  await prisma.generated.upsert({
    where: { userId },
    update: { taste },
    create: { userId, taste },
  });

  return taste;
}

export async function generatePlaylist(
  args: {
    mood: string;
    year: string;
    familiar: boolean | null;
    popular: boolean | null;
  },
  userId: string,
) {
  const songs = await prisma.topSongs.findFirst({
    include: {
      tracks: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      userId,
      type: "long_term",
    },
  });

  const artists = await prisma.topArtists.findFirst({
    include: {
      artists: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      userId,
      type: "long_term",
    },
  });

  const { mood, year, familiar, popular } = args;
  const result = await askAITracks({
    mood,
    year,
    familiar,
    popular,
    top: {
      songs:
        songs?.tracks.map((track) => ({
          name: track.name,
          artist: track.artist,
        })) ?? [],
      artists:
        artists?.artists.map((artist) => ({
          name: artist.name,
        })) ?? [],
    },
  });

  const promises = result.map(async (track) => {
    const exists = await prisma.track.findFirst({
      where: {
        name: {
          contains: track.name,
        },
        artist: {
          contains: track.artist,
        },
      },
    });

    if (exists) {
      return exists;
    }

    const created = await getTrackFromSpotify(
      `${track.name} ${track.artist}`,
      userId,
    );

    if (!created) return null;

    const result = await prisma.track.findFirst({
      where: {
        id: created,
      },
    });

    return result;
  });

  const tracks = (await Promise.all(promises)).filter(
    (track) => track !== null,
  );

  const existing = await prisma.generatedPlaylist.findFirst({
    where: {
      mood,
      year: parseInt(year),
      familiar,
      popular,
      owner: {
        userId,
      },
    },
  });

  if (existing) {
    await prisma.generatedPlaylist.update({
      where: { id: existing.id },
      data: {
        tracks: {
          set: tracks.map((track) => ({ id: track.id })),
        },
      },
    });

    return existing.id;
  }

  let ai = await prisma.generated.findUnique({
    where: { userId },
  });

  if (!ai) {
    ai = await prisma.generated.create({
      data: {
        userId,
      },
    });
  }

  const { id } = await prisma.generatedPlaylist.create({
    data: {
      id: generateId(),
      mood,
      year: parseInt(year),
      familiar,
      popular,
      tracks: {
        connect: tracks.map((track) => ({ id: track.id })),
      },
      owner: {
        connect: {
          id: ai.id,
        },
      },
    },
  });

  return id;
}
