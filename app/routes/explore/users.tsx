import type { LoaderArgs } from '@remix-run/node';
import { useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';

import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import { useRevalidatorStore } from '~/hooks/useRevalidatorStore';
import { useSearch } from '~/hooks/useSearchStore';
import useVisibilityChange from '~/hooks/useVisibilityChange';
import type { Track } from '~/lib/types/types';
import { authenticator, getAllUsers } from '~/services/auth.server';

const Users = () => {
  const { currentUserId, users } = useTypedLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const search = useSearch();
  const shouldRevalidate = useRevalidatorStore((state) => state.shouldRevalidate);
  const friends = users.filter((user) => user.userId !== currentUserId);
  const sortedFriends = friends.sort((a, b) => {
    if (!!b.playback?.updatedAt && !a.playback?.updatedAt) {
      return 1;
    } else if (!!a.playback?.updatedAt && !b.playback?.updatedAt) {
      return -1;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  const searchedUsers = users.filter((user) => {
    if (search.trim() === '') {
      return user;
    } else {
      return user.name.toLowerCase().includes(search.toLowerCase());
    }
  });

  useVisibilityChange((isVisible) => isVisible === true && !shouldRevalidate && revalidate());

  useEffect(() => {
    if (shouldRevalidate) {
      console.log('shouldRevalidate', shouldRevalidate);
      // revalidate();
    }
  }, [shouldRevalidate, revalidate]);

  const tracks: Track[] = [];
  for (let i = 0; i < sortedFriends.length; i++) {
    if (sortedFriends[i].playback === null || sortedFriends[i].playback?.track === undefined) {
      continue;
    }
    const track = {
      albumName: sortedFriends[i].playback!.track.albumName,
      albumUri: sortedFriends[i].playback!.track.albumUri,
      artist: sortedFriends[i].playback!.track.artist,
      artistUri: sortedFriends[i].playback!.track.artistUri,
      duration: sortedFriends[i].playback!.track.duration,
      explicit: sortedFriends[i].playback!.track.explicit,
      id: sortedFriends[i].playback!.track.id,
      image: sortedFriends[i].playback!.track.image,
      link: sortedFriends[i].playback!.track.link,
      name: sortedFriends[i].playback!.track.name,
      preview_url: sortedFriends[i].playback!.track.preview_url,
      uri: sortedFriends[i].playback!.track.uri,
    };
    tracks.push(track);
  }

  return (
    <Stack pt={0} pb="100px" spacing={3} w="100%" h="100%" px={['4px', 0]}>
      {searchedUsers.map((user, index) => {
        return (
          <PrismaMiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayer' + index}
            user={user}
            currentUserId={currentUserId}
            tracks={tracks}
            index={index}
          />
        );
      })}
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;
  const users = await getAllUsers(!!currentUser);
  const currentUserId = currentUser?.id;

  return typedjson({ currentUserId, now: Date.now(), users });
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default Users;
