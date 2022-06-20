import { Avatar, Box, Heading, HStack, Stack, Text, useInterval } from '@chakra-ui/react';
import { prisma } from '~/services/db.server';
import type { Party, Profile as ProfileType } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useDataRefresh } from 'remix-utils';

import Player from '~/components/Player';
import Tile from '~/components/Tile';
import Tiles from '~/components/Tiles';
import { spotifyApi } from '~/services/spotify.server';
import { getCurrentUser } from '~/services/auth.server';

const Profile = () => {
  const { user, playback, recent, currentUser, party } = useLoaderData<{
    user: ProfileType | null;
    playback: SpotifyApi.CurrentPlaybackResponse | null;
    recent: SpotifyApi.UsersRecentlyPlayedTracksResponse | null;
    currentUser: ProfileType | null;
    party: Party[];
  }>();
  let { refresh } = useDataRefresh();
  const [progress, setProgress] = useState(0);
  const duration = playback?.item?.duration_ms;
  const percentage = duration ? (progress / duration) * 100 : 0;

  useEffect(() => {
    const _progress = playback?.progress_ms;
    if (_progress) {
      setProgress(_progress);
    }
  }, [playback]);

  useInterval(() => {
    if (!duration) return null;
    if (progress > duration) {
      refresh();
    }
    setProgress((prev) => prev + 1000);
  }, 1000);

  return (
    <Stack spacing={10}>
      {user && playback && recent ? (
        <>
          <Stack spacing={7}>
            <HStack>
              <Avatar size="xl" boxSize={93} src={user.image} />
              <Heading size="lg" fontWeight="bold">
                {user.name}
                {/*user.bio*/}
              </Heading>
            </HStack>
            {playback.is_playing ? (
              <Player
                id={user.userId}
                name={playback.item?.name}
                artist={
                  playback.item?.type === 'track' ? playback.item?.album?.artists[0].name : ''
                }
                image={playback.item?.type === 'track' ? playback.item.album?.images[0].url : ''}
                device={playback.device.name}
                type={playback.item?.type}
                progress={percentage}
                currentUser={currentUser}
                party={party}
              />
            ) : (
              <Player
                id={user.userId}
                name={recent.items[0].track.name}
                artist={recent.items[0].track.artists[0].name}
                image={recent.items[0].track.album.images[1].url}
                device={playback.device.name}
                type={playback.item?.type}
                progress={percentage}
                currentUser={currentUser}
                party={party}
              />
            )}
          </Stack>
          {/* <Stack spacing={5}>
            <Heading fontSize={20}>Queue +</Heading>
            <Tiles>
              {recent.items.map(({ track, played_at }) => {
                return (
                  <Tile
                    // if use track.id then key will be repeated if user replays a song
                    key={played_at}
                    image={track.album.images[1].url}
                    name={track.name}
                    artist={track.album.artists[0].name}
                  />
                );
              })}
            </Tiles>
          </Stack> */}
          <Stack spacing={5}>
            <Heading size="md">Recently played</Heading>
            <Tiles>
              {recent.items.map(({ track, played_at }) => {
                return (
                  <Tile
                    key={played_at}
                    image={track.album.images[1].url}
                    name={track.name}
                    artist={track.album.artists[0].name}
                  />
                );
              })}
            </Tiles>
          </Stack>
        </>
      ) : (
        <Stack>
          <Heading size="md">404</Heading>
          <Text>User not found</Text>
        </Stack>
      )}
    </Stack>
  );
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const id = params.id;
  if (!id) throw redirect('/');
  const { spotify, user } = await spotifyApi(id);

  if (!spotify) return { user: null, playback: null, recent: null, party: null, currentUser: null };

  const party = await prisma.party.findMany({ where: { ownerId: id } });
  const { body: playback } = await spotify.getMyCurrentPlaybackState();
  const { body: recent } = await spotify.getMyRecentlyPlayedTracks();

  const currentUser = await getCurrentUser(request);

  return { user, playback, recent, party, currentUser };
};

export default Profile;

// import SpotifyWebApi from 'spotify-web-api-node';
// const Search = () => {
//   const spotifyApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
//   const [search, setSearch] = useState<string>('');
//   const [searchResults, setSearchResults] = useState<{ title: string; artist: string; art: string }[] | undefined>([]);
//   // const { searchTracks } = useLoaderData<{
//   //   searchTracks: SpotifyApi.SingleTrackResponse;
//   // }>();

//   // useEffect(() => {
//   //   if (!updateToken) return;
//   //   spotifyApi.setAccessToken(updateToken.id);
//   // }, [updateToken]);

//   useEffect(() => {
//     if (!search) return setSearchResults([]);
//     // if (!updateToken) return;
//     let isSearching = false;
//     spotifyApi.searchTracks(search).then((res) => {
//       if (isSearching) return;
//       setSearchResults(
//         res.body.tracks?.items.map((track) => {
//           return { title: track.name, artist: track.artists[0].name, art: track.album.images[1].url };
//         }),
//       );
//     });
//     return (isSearching = true);
//   }, [search]);

//   return (
//     <Stack height={['100vh']} width={['100vw']}>
//       <Input type="search" placeholder="songs" value={search} onChange={(e) => setSearch(e.target.value)} />
//       {searchResults?.map((track) => (
//         <VStack key={track.art}>
//           <HStack>
//             <Image src={track.art} boxSize="50px" />
//             <VStack>
//               <Text>{track.title}</Text>
//               <Text>{track.artist}</Text>
//             </VStack>
//           </HStack>
//         </VStack>
//       ))}
//     </Stack>
//   );
// };

export const CatchBoundary = () => {
  return (
    <Box>
      <Heading as="h2">I caught some condition</Heading>
    </Box>
  );
};

export const ErrorBoundary = ({ error }: any) => {
  return (
    <Box bg="red.400" px={4} py={2}>
      <Heading as="h3" size="lg" color="white">
        Something is really wrong!{' >:('}
      </Heading>
      <Box color="white" fontSize={22}>
        {error.message}
      </Box>
    </Box>
  );
};
