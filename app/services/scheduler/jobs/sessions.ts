import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';

/**
 * Sessions are songs that were played within the same seat.
 * As we go our day, we may listen to a song on our way to work, or on our way home.
 * We may listen to a song while we're working, or while we're cooking dinner.
 * We may listen to a song while we're working out, or while we're taking a shower.
 * These are all "sessions"
 *
 * The goal of this job is to find songs that were played within 10 minutes of each other, and group them into sessions.
 *
 */

// 30 minutes
const TIME_BETWEEN_SONGS_TO_QUALIFY_AS_SESSION_MS = 30 * 60 * 1000;

export const sessionsQ = Queue<{}>('sessions', async () => {
  console.log('sessionsQ -> running...');
  // Find a song without a session
  const songWithoutSession = await prisma.recentSongs.findFirst({
    orderBy: {
      playedAt: 'desc',
    },
    where: {
      sessionId: null,
    },
  });

  // If there are no songs without a session, we're done
  if (!songWithoutSession) {
    console.log('sessionsQ -> no songs without a session');
    return;
  }

  console.log('sessionsQ -> found song without session', songWithoutSession.id);
  // Find sessions that have songs that were played within 30 minutes of the song we found above
  const session = await prisma.sessions.findFirst({
    orderBy: {
      startTime: 'desc',
    },
    where: {
      songs: {
        some: {
          playedAt: {
            gte: new Date(
              songWithoutSession.playedAt.getTime() - TIME_BETWEEN_SONGS_TO_QUALIFY_AS_SESSION_MS,
            ),
            lte: new Date(
              songWithoutSession.playedAt.getTime() + TIME_BETWEEN_SONGS_TO_QUALIFY_AS_SESSION_MS,
            ),
          },
        },
      },
      userId: songWithoutSession.userId,
    },
  });

  if (session) {
    console.log('sessionsQ -> found session', session.id);
    // If there is a session, add the song to the session
    await prisma.recentSongs.update({
      data: {
        sessionId: session.id,
      },
      where: {
        id: songWithoutSession.id,
      },
    });

    return;
  }

  console.log('sessionsQ -> no session found, creating new session');
  // If there is no session, create a new session
  await prisma.sessions.create({
    data: {
      songs: {
        connect: {
          id: songWithoutSession.id,
        },
      },
      startTime: songWithoutSession.playedAt,
      userId: songWithoutSession.userId,
    },
  });
});

declare global {
  // eslint-disable-next-line no-var
  var __didRegisterSessionsQ: boolean | undefined;
}

export async function runSessionsQ() {
  console.log('runSessionsQ -> starting...');
  // To ensure this function only runs once per environment,
  // we use a global variable to keep track if it has run
  if (global.__didRegisterSessionsQ) {
    console.log('runSessionsQ -> already ran');
    // and stop if it did.
    return;
  }
  // If it hasn't run, we set the global variable to true
  global.__didRegisterSessionsQ = true;

  console.log('runSessionsQ -> registering job');
  await sessionsQ.obliterate({ force: true });
  await sessionsQ.add(
    'sessions',
    {},
    {
      jobId: 'sessions',
      removeOnComplete: true,
      removeOnFail: true,
      repeat: { every: 1000 },
    },
  );

  console.log(
    'sessionsQ -> non repeateable jobs created (only at startup):',
    await sessionsQ.getJobCounts(),
  );
}
