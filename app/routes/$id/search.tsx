import type { LoaderArgs } from '@remix-run/node';

import { Box } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import SendButton from '~/components/menu/actions/SendButton';
import Tile from '~/components/Tile';
import TileImage from '~/components/TileImage';
import TileInfo from '~/components/TileInfo';
import Tiles from '~/components/tiles/Tiles';
import type { Track } from '~/lib/types/types';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

const Search = () => {
  const { results } = useTypedLoaderData<typeof loader>();
  const tracks = results?.tracks?.items ?? [];

  const songs: Track[] = [];
  for (let i = 0; i < tracks.length; i++) {
    const track = {
      albumName: tracks[i].album.name,
      albumUri: tracks[i].album.uri,
      artist: tracks[i].artists[0].name,
      artistUri: tracks[i].artists[0].uri,
      duration: tracks[i].duration_ms,
      explicit: tracks[i].explicit,
      id: tracks[i].id,
      image: tracks[i].album.images[0]?.url,
      link: tracks[i].external_urls.spotify,
      name: tracks[i].name,
      preview_url: tracks[i].preview_url,
      uri: tracks[i].uri,
    };
    songs.push(track);
  }

  if (tracks.length === 0) return <></>;

  return (
    <Box h="60vh" zIndex={9}>
      <Tiles title="">
        {tracks?.map((track, index) => {
          const song = {
            albumName: track.album.name,
            albumUri: track.album.uri,
            artist: track.artists[0].name,
            artistUri: track.artists[0].uri,
            duration: track.duration_ms,
            explicit: track.explicit,
            id: track.id,
            image: track.album.images[1].url,
            link: track.external_urls.spotify,
            name: track.name,
            preview_url: track.preview_url,
            uri: track.uri,
          };
          return (
            <Tile
              key={track.id}
              track={song}
              tracks={songs}
              index={index}
              layoutKey="search"
              action={<SendButton track={song} />} // refactor search to recommend and queue
              image={<TileImage />}
              info={<TileInfo />}
            />
          );
        })}
      </Tiles>
    </Box>
  );
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const { id } = params;
  invariant(id, 'Missing param Id');

  const { spotify } = await spotifyApi(id);
  invariant(spotify, 'No access to spotify API');
  const url = new URL(request.url);
  const searchURL = url.searchParams.get('spotify');
  if (!searchURL) return typedjson({ results: null });

  const { body: results } = await spotify.searchTracks(searchURL);

  const users = await prisma.profile.findMany({ where: { name: { startsWith: searchURL } } });
  return typedjson({ results, users });
};

export default Search;
