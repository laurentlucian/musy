import {
  Heading,
  HStack,
  IconButton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useNavigate, useParams } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/server-runtime';
import { ArrowLeft2 } from 'iconsax-react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';
import { decodeHtmlEntity } from '~/components/playlists/PlaylistTile';
import Track from '~/components/Track';
import { spotifyApi } from '~/services/spotify.server';

const Playlist = () => {
  const { playlist } = useTypedLoaderData<typeof loader>();
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Stack>
      <HStack>
        <IconButton
          aria-label="Back"
          icon={<ArrowLeft2 />}
          variant="ghost"
          onClick={() => navigate(`/${id}`)}
        />
        <Heading size="sm">{playlist.name}</Heading>
        {playlist.description ? (
          <Text fontSize="12px" opacity={0.8} noOfLines={2}>
            {decodeHtmlEntity(playlist.description)}
          </Text>
        ) : null}
      </HStack>
      <TableContainer margin="0px" padding="0px">
        <Table variant="unstyled" margin="0px" padding="0px">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Album</Th>
              <Th>Date added</Th>
            </Tr>
          </Thead>
          <Tbody>
            {playlist.tracks.items.map(({ track, added_at }) => {
              if (!track) return null;

              return <Track key={track.id} track={track} addedAt={added_at} />;
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const id = params.id;
  const playlistId = params.playlist;
  invariant(id, 'Missing params id');
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
