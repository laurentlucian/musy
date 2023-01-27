import invariant from 'tiny-invariant';
import { createTrackModel, isProduction, minutesToMs, notNull } from '~/lib/utils';
import { getAllUsers } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';
import { spotifyApi } from '~/services/spotify.server';
import { playbackCreator, playbackQ } from './playback';
import { libraryQ, longScriptQ } from './scraper';

export const userQ = Queue<{ userId: string }>(
  'update_tracks',
  async (job) => {
    const { userId } = job.data;
    console.log('userQ -> pending job starting...', userId);

    await playbackCreator();
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      include: { user: true },
    });

    const { spotify } = await spotifyApi(userId);

    if (!profile || !profile.user || !spotify) {
      console.log(`userQ ${userId} removed -> user not found`);
      const jobKey = job.repeatJobKey;
      if (jobKey) {
        await userQ.removeRepeatableByKey(jobKey);
      }
      return null;
    }

    console.log('userQ -> adding recent tracks to db', userId);
    const {
      body: { items: recent },
    } = await spotify.getMyRecentlyPlayedTracks({ limit: 50 });
    for (const { track, played_at } of recent) {
      const trackDb = createTrackModel(track);
      const data = {
        playedAt: new Date(played_at),

        name: track.name,
        uri: track.uri,
        albumName: track.album.name,
        albumUri: track.album.uri,
        artist: track.artists[0].name,
        artistUri: track.artists[0].uri,
        image: track.album.images[0].url,
        explicit: track.explicit,
        preview_url: track.preview_url,
        link: track.external_urls.spotify,
        duration: track.duration_ms,
        action: 'played',

        user: {
          connect: {
            userId,
          },
        },
      };

      await prisma.recentSongs.upsert({
        where: {
          playedAt_userId: {
            playedAt: data.playedAt,
            userId: userId,
          },
        },
        update: {
          ...data,
          track: {
            connectOrCreate: {
              create: trackDb,
              where: {
                id: track.id,
              },
            },
          },
        },
        create: {
          ...data,
          track: {
            connectOrCreate: {
              create: trackDb,
              where: {
                id: track.id,
              },
            },
          },
        },
      });
    }

    console.log('userQ -> adding liked tracks to db', userId);
    const {
      body: { items: liked, total },
    } = await spotify.getMySavedTracks({ limit: 50 });

    for (const { track, added_at } of liked) {
      const trackDb = createTrackModel(track);

      const data = {
        likedAt: new Date(added_at),
        name: track.name,
        uri: track.uri,
        albumName: track.album.name,
        albumUri: track.album.uri,
        artist: track.artists[0].name,
        artistUri: track.artists[0].uri,
        image: track.album.images[0].url,
        explicit: track.explicit,
        preview_url: track.preview_url,
        link: track.external_urls.spotify,
        duration: track.duration_ms,
        action: 'liked',

        user: {
          connect: {
            userId,
          },
        },
      };

      await prisma.likedSongs.upsert({
        where: {
          trackId_userId: {
            trackId: track.id,
            userId: userId,
          },
        },
        update: {
          ...data,
          track: {
            connectOrCreate: {
              create: trackDb,
              where: {
                id: track.id,
              },
            },
          },
        },
        create: {
          ...data,
          track: {
            connectOrCreate: {
              create: trackDb,
              where: {
                id: track.id,
              },
            },
          },
        },
      });
    }
    console.log('userQ -> added liked tracks', userId);

    const dbTotal = await prisma.likedSongs.count({
      where: { userId },
    });

    // we want to scrape all of user's liked songs, this is useful for showing dynamic UI to the current logged in user
    // so, if the total from spotify is greater than the total in the db
    // loop through the rest of the pages and add them to the db

    if (total > dbTotal && isProduction) {
      // by default, don't scrape all liked tracks in dev
      // change above to !isProduction to scrape all liked tracks as needed
      // make sure to uncomment lines 221&222 to only run this job for your own user id

      const limit = 50;
      const pages = Math.ceil(total / limit);
      console.log('userQ -> total > dbTotal', total, dbTotal, pages, userId);
      const {
        body: {
          items: [lastTrack],
        },
      } = await spotify.getMySavedTracks({ limit: 1, offset: total - 1 });
      // note: if user disliked songs after we've added all to db, this would've run every time job repeats
      // if last track exists in our db, then don't scrape all pages
      console.log('userQ -> lastTrack', lastTrack.track.name);
      const exists = await prisma.likedSongs.findUnique({
        where: {
          trackId_userId: {
            trackId: lastTrack.track.id,
            userId,
          },
        },
      });
      console.log('userQ -> last track exists?', exists);

      if (!exists) {
        console.log(
          'userQ -> adding all user liked tracks to db',
          userId,
          'pages',
          pages,
          'total',
          total,
          'dbTotal',
          dbTotal,
        );
        await libraryQ.add(
          'user-library',
          {
            userId,
            pages,
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
          },
        );
      } else {
        console.log('userQ -> all liked tracks already in db', userId, total, dbTotal);
      }
    }

    console.log('userQ -> completed', userId);
  },
  {
    limiter: {
      max: 1,
      duration: minutesToMs(1),
    },
  },
);

declare global {
  var __didRegisterLikedQ: boolean | undefined;
}

export const addUsersToQueue = async () => {
  console.log('addUsersToQueue -> starting...');
  // To ensure this function only runs once per environment,
  // we use a global variable to keep track if it has run
  if (global.__didRegisterLikedQ) {
    // and stop if it did.

    // console.log(
    //   'addUsersToQueue -> already registered, repeating jobs:',
    //   (await userQ.getRepeatableJobs()).map((j) => [
    //     j.name,

    //     j.next,
    //     new Date(j.next).toLocaleString('en-US', {
    //       hour: 'numeric',
    //       minute: 'numeric',
    //       second: 'numeric',
    //     }),
    //   ]),
    // );

    console.log(
      'playbackQ',
      (await playbackQ.getDelayed()).map((j) => [j.name, j.data]),
    );

    return;
  }

  const cleaned = await playbackQ.clean(0, 0, 'delayed');
  const cleaned1 = await playbackQ.clean(0, 0, 'active');
  await prisma.playback.deleteMany();

  console.log(
    'playbackQ',
    (await playbackQ.getDelayed()).map((j) => [j.name, j.data]),
  );

  // needed this once because forgot to save duration_ms in db
  // await addDurationToRecent();
  // console.log('addUsersToQueue -> added all durations to recent');

  const users = await getAllUsers();
  console.log(
    'addUsersToQueue -> users..',
    users.map((u) => u.userId),
    users.length,
  );

  // await userQ.pause(); // pause all jobs before obliterating
  // await userQ.obliterate({ force: true }); // https://github.com/taskforcesh/bullmq/issues/430
  console.log('addUsersToQueue -> obliterated userQ');

  // for testing
  // await userQ.add('update_liked', { userId: '1295028670' });
  // return;

  // https: github.com/OptimalBits/bull/issues/1731#issuecomment-639074663
  // bulkAll doesn't support repeateable jobs
  for (const user of users) {
    await userQ.add(
      user.userId,
      { userId: user.userId },
      {
        // a job with duplicate id will not be added
        jobId: user.userId,
        repeat: { every: minutesToMs(isProduction ? 30 : 60) },
        backoff: {
          type: 'exponential',
          delay: minutesToMs(1),
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  // repeateableJobs are started with delay, so run these manually at startup
  await userQ.addBulk(
    users.map((user) => ({
      name: 'update_liked',
      data: {
        userId: user.userId,
      },
    })),
  );

  console.log(
    'addUsersToQueue -> non repeateable jobs created (only at startup):',
    await userQ.getJobCounts(),
  );

  // await addMissingTracks();
  // if ((await longScriptQ.getJobs())?.length === 0 && isProduction) {
  //   longScriptQ.add('long-script', null);
  // }

  console.log('addUsersToQueue -> done');
  global.__didRegisterLikedQ = true;
};

// ------------------------------------------------------------- SCRIPTS

const addMissingTracks = async () => {
  const { spotify } = await spotifyApi('1295028670');

  if (!spotify) {
    console.log('addMissingTracks -> skipping script. no spotify');
    return;
  }
  const recents = await prisma.recentSongs.findMany({ where: { track: null } });
  console.log('recents', recents.length);

  for (const recent of recents) {
    const { albumName, albumUri, artistUri, preview_url, link } = recent;

    if (!albumName || !albumUri || !artistUri) {
      console.log('missing', 'albumName', albumName, 'albumUri', albumUri, 'artistUri', artistUri);

      const track = await prisma.track.findUnique({ where: { id: recent.trackId } });

      if (track) {
        console.log('track found', recent.name);
        await prisma.recentSongs.update({
          where: {
            id: recent.id,
          },
          data: {
            track: {
              connect: {
                id: recent.trackId,
              },
            },
          },
        });
        continue;
      }

      if (!track) {
        console.log('track not found', recent.name);
        const { body: track } = await spotify.getTrack(recent.trackId);
        const trackDb = createTrackModel(track);
        await prisma.recentSongs.update({
          where: {
            id: recent.id,
          },
          data: {
            track: {
              create: trackDb,
            },
          },
        });
      }

      continue;
    }
    if (!preview_url || !link) {
      console.log('missing', 'preview_url', preview_url, 'link', link);

      const track = await prisma.track.findUnique({ where: { id: recent.trackId } });

      if (track) {
        console.log('track found', recent.name);
        await prisma.recentSongs.update({
          where: {
            id: recent.id,
          },
          data: {
            track: {
              connect: {
                id: recent.trackId,
              },
            },
          },
        });
        continue;
      }

      if (!track) {
        console.log('track not found', recent.name);
        const { body: track } = await spotify.getTrack(recent.trackId);
        const trackDb = createTrackModel(track);
        await prisma.recentSongs.update({
          where: {
            id: recent.id,
          },
          data: {
            track: {
              create: trackDb,
            },
          },
        });
      }

      continue;
    }

    await prisma.recentSongs
      .update({
        where: {
          id: recent.id,
        },
        data: {
          track: {
            connectOrCreate: {
              create: {
                id: recent.trackId,
                name: recent.name,
                uri: recent.uri,
                albumName,
                albumUri,
                artistUri,
                artist: recent.artist,
                image: recent.image,
                explicit: recent.explicit,
                preview_url: recent.preview_url,
                link: recent.link,
                duration: recent.duration,
              },
              where: {
                id: recent.trackId,
              },
            },
          },
        },
      })
      .then((res) => console.log('updated', res))
      .catch((err) => console.log('err', err));
  }

  const liked = await prisma.likedSongs.findMany({ where: { track: null } });
  console.log('liked', liked.length);

  for (const like of liked) {
    const { albumName, albumUri, artistUri, preview_url, link } = like;

    if (!albumName || !albumUri || !artistUri) {
      console.log('missing', 'albumName', albumName, 'albumUri', albumUri, 'artistUri', artistUri);

      const track = await prisma.track.findUnique({ where: { id: like.trackId } });

      if (track) {
        console.log('track found', like.name);
        await prisma.likedSongs.update({
          where: {
            id: like.id,
          },
          data: {
            track: {
              connect: {
                id: like.trackId,
              },
            },
          },
        });
        continue;
      }

      if (!track) {
        console.log('track not found', like.name);
        const { body: track } = await spotify.getTrack(like.trackId);
        const trackDb = createTrackModel(track);
        await prisma.likedSongs.update({
          where: {
            id: like.id,
          },
          data: {
            track: {
              create: trackDb,
            },
          },
        });
      }

      continue;
    }
    if (!preview_url || !link) {
      console.log('missing', 'preview_url', preview_url, 'link', link);

      const track = await prisma.track.findUnique({ where: { id: like.trackId } });

      if (track) {
        console.log('track found', like.name);
        await prisma.likedSongs.update({
          where: {
            id: like.id,
          },
          data: {
            track: {
              connect: {
                id: like.trackId,
              },
            },
          },
        });
        continue;
      }

      if (!track) {
        console.log('track not found', like.name);
        const { body: track } = await spotify.getTrack(like.trackId);
        const trackDb = createTrackModel(track);
        await prisma.likedSongs.update({
          where: {
            id: like.id,
          },
          data: {
            track: {
              create: trackDb,
            },
          },
        });
      }

      continue;
    }

    await prisma.likedSongs
      .update({
        where: {
          id: like.id,
        },
        data: {
          track: {
            connectOrCreate: {
              create: {
                id: like.trackId,
                name: like.name,
                uri: like.uri,
                albumName,
                albumUri,
                artistUri,
                artist: like.artist,
                image: like.image,
                explicit: like.explicit,
                preview_url: like.preview_url,
                link: like.link,
                duration: like.duration,
              },
              where: {
                id: like.trackId,
              },
            },
          },
        },
      })
      .then((res) => console.log('updated', res))
      .catch((err) => console.log('err', err));
  }

  const queued = await prisma.queue.findMany({ where: { track: null } });
  console.log('queued', queued.length);

  for (const queue of queued) {
    const { trackId, albumName, albumUri, artistUri } = queue;

    if (!trackId) {
      console.log('missing trackId', queue.name);
      const {
        body: { tracks },
      } = await spotify.searchTracks(queue.name);
      if (!tracks) {
        console.log('no track found', queue.name);
        continue;
      }

      const trackDb = createTrackModel(tracks.items[0]);
      await prisma.queue.update({
        where: {
          id: queue.id,
        },
        data: {
          track: {
            connectOrCreate: {
              create: trackDb,
              where: {
                id: trackDb.id,
              },
            },
          },
        },
      });

      continue;
    }

    // if (!albumName || !albumUri || !artistUri) {
    //   console.log('missing', 'albumName', albumName, 'albumUri', albumUri, 'artistUri', artistUri);

    //   const track = await prisma.track.findUnique({ where: { id: trackId } });

    //   if (track) {
    //     console.log('track found', queue.name);
    //     await prisma.queue.update({
    //       where: {
    //         id: queue.id,
    //       },
    //       data: {
    //         track: {
    //           connect: {
    //             id: trackId,
    //           },
    //         },
    //       },
    //     });
    //     continue;
    //   }

    //   if (!track) {
    //     console.log('track not found', queue.name);
    //     const { body: track } = await spotify.getTrack(trackId);
    //     const trackDb = createTrackModel(track);
    //     await prisma.queue.update({
    //       where: {
    //         id: queue.id,
    //       },
    //       data: {
    //         track: {
    //           create: trackDb,
    //         },
    //       },
    //     });
    //   }

    //   continue;
    // }

    // await prisma.queue
    //   .update({
    //     where: {
    //       id: queue.id,
    //     },
    //     data: {
    //       track: {
    //         connectOrCreate: {
    //           create: {
    //             id: trackId,
    //             name: queue.name,
    //             uri: queue.uri,
    //             albumName,
    //             albumUri,
    //             artistUri,
    //             artist: queue.artist,
    //             image: queue.image,
    //             explicit: queue.explicit,
    //             duration: queue.duration,
    //           },
    //           where: {
    //             id: trackId,
    //           },
    //         },
    //       },
    //     },
    //   })
    //   .then((res) => console.log('updated', res))
    //   .catch((err) => console.log('err', err));
  }
};

const addDurationToRecent = async () => {
  const { spotify } = await spotifyApi('1295028670');
  invariant(spotify, 'No spotify');
  const recent = await prisma.recentSongs.findMany();

  const trackIdsDuplicates = recent.map((t) => t.trackId).filter(notNull);
  const trackIds = Array.from(new Set(trackIdsDuplicates));

  console.log('trackIds', trackIds.length);

  // create pages of 50 from trackIds and call getTracks with 50 ids and loop through pages
  // without library
  const pages = [];
  for (let i = 0; i < trackIds.length; i += 50) {
    pages.push(trackIds.slice(i, i + 50));
  }

  console.log('pages', pages.length);
  // loop through pages and getTracks
  for (const page of pages) {
    const {
      body: { tracks },
    } = await spotify.getTracks(page);
    console.log('a page', page.length);

    for (const track of tracks) {
      const duration = track.duration_ms;
      await prisma.recentSongs.updateMany({
        where: {
          trackId: track.id,
        },
        data: {
          duration,
        },
      });
    }
  }
};
export const addPreviewUrlAndLink = async () => {
  const trackIds = await prisma.track.findMany({ where: { link: '' }, select: { id: true } });
  if (trackIds && trackIds.length > 0) {
    const { spotify } = await spotifyApi('1295028670');
    invariant(spotify, 'No spotify');

    const trackIdz = trackIds.map((t) => t.id);

    // create pages of 50 from trackIds and call getTracks with 50 ids and loop through pages
    // without library

    const pages = [];
    for (let i = 0; i < trackIdz.length; i += 50) {
      pages.push(trackIdz.slice(i, i + 50));
    }

    console.log('trackModelScript -> pages', pages.length);
    // deviding pages by 30 seconds, script will be completed in:
    console.log('trackModelScript ->  ' + (pages.length * 30) / 60 + ' minutes until completion');

    // loop through pages and getTracks
    for (const page of pages) {
      const {
        body: { tracks },
      } = await spotify.getTracks(page);
      console.log('trackModelScript -> a page', page.length);

      for (const track of tracks) {
        const preview_url = track.preview_url;
        const link = track.external_urls.spotify;
        await prisma.track.update({
          where: {
            id: track.id,
          },
          data: {
            preview_url,
            link,
          },
        });
      }

      // sleep for 5 seconds to avoid api limit
      console.log('trackModelScript -> sleeping for 30 seconds');
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }
  }
};
