import { useNavigate, useParams } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/server-runtime';

import {
  Heading,
  HStack,
  IconButton,
  Image,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';

import { ArrowLeft2 } from 'iconsax-react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { decodeHtmlEntity } from '~/components/profile/tiles/playlists/PlaylistTile';
import Track from '~/components/Track';
import useIsMobile from '~/hooks/useIsMobile';
import type { Track as Tracks } from '~/lib/types/types';
import { spotifyApi } from '~/services/spotify.server';

const Playlist = () => {
  const { playlist } = useTypedLoaderData<typeof loader>();
  const { id } = useParams();
  const navigate = useNavigate();
  const isSmallScreen = useIsMobile();

  const tracks: Tracks[] = playlist.tracks.items.map((track) => {
    return {
      albumName: track.track?.album.name ?? 'No Tracks',
      albumUri: track.track?.album.uri ?? '',
      artist: track.track?.artists[0].name ?? '',
      artistUri: track.track?.artists[0].uri ?? '',
      duration: track.track?.duration_ms ?? 0,
      explicit: track.track?.explicit ?? false,
      id: track.track?.id ?? '',
      image: track.track?.album.images[0]?.url ?? '',
      link: track.track?.external_urls.spotify ?? '',
      name: track.track?.name ?? '',
      preview_url: track.track?.preview_url ?? '',
      uri: track.track?.uri ?? '',
    };
  });

  return (
    <Stack zIndex={5}>
      <HStack>
        <IconButton
          aria-label="Back"
          icon={<ArrowLeft2 />}
          variant="ghost"
          onClick={() => navigate(-1)}
        />
        <Image src={playlist.images[0]?.url} boxSize={['90px', '140px']} />
        <Stack>
          <Heading size="sm">{playlist.name}</Heading>
          {playlist.description ? (
            <Text fontSize="12px" opacity={0.8} noOfLines={2}>
              {decodeHtmlEntity(playlist.description)}
            </Text>
          ) : null}
        </Stack>
      </HStack>
      <TableContainer margin="0px" padding="0px">
        <Table variant="unstyled" margin="0px" padding="0px">
          <Thead>
            <Tr>
              <Th>Title</Th>
              {isSmallScreen ? null : (
                <>
                  <Th>Album</Th>
                  <Th>Date added</Th>
                  <Th>Song Length</Th>
                </>
              )}
            </Tr>
          </Thead>
          <Tbody zIndex={5}>
            {playlist.tracks.items.map(({ added_at, track }, index) => {
              if (!track) return null;

              return (
                <Track
                  key={track.id}
                  track={track}
                  addedAt={added_at}
                  userId={id ?? ''}
                  tracks={tracks}
                  index={index}
                />
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export const loader = async ({ params }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params id');
  const playlistId = params.playlist;
  invariant(playlistId, 'Missing params playlistId');

  const { spotify } = await spotifyApi(id).catch(async (e) => {
    if (e instanceof Error && e.message.includes('revoked')) {
      throw new Response('User Access Revoked', { status: 401 });
    }
    throw new Response('Failed to load Spotify', { status: 500 });
  });
  if (!spotify) {
    throw new Response('Failed to load Spotify [2]', { status: 500 });
  }

  const { body: playlist } = await spotify.getPlaylist(playlistId);

  return typedjson({ playlist });
};

export default Playlist;
