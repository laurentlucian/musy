import { default as ExpandedPlayLists } from '../ExpandedSongs';
import { usePlaylists } from '~/hooks/usePlaylist';
import PlaylistTile from '../playlists/PlaylistTile';
import PlaylistCard from './PlaylistCard';
import { Stack } from '@chakra-ui/react';
import { useCallback } from 'react';
import Tiles from './Tiles';
import PlaylistDrawer from '../playlists/PlaylistDrawer';

const Playlists = ({
  playlists: initialPlaylists,
}: {
  playlists: SpotifyApi.PlaylistObjectSimplified[];
}) => {
  const { playlists, show, setShow, setRef } = usePlaylists(initialPlaylists);

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  if (!playlists) return null;
  const scrollButtons = playlists.length > 5;
  const title = 'Playlists';
  return (
    <Stack spacing={3}>
      <Tiles title={title} scrollButtons={scrollButtons} setShow={setShow}>
        {playlists.map((list, index) => {
          const isLast = index === playlists.length - 1;

          return (
            <PlaylistTile
              ref={(node) => {
                isLast && setRef(node);
              }}
              key={list.id}
              uri={list.uri}
              link={list.external_urls.spotify ?? ''}
              name={list.name}
              image={list.images[0]?.url}
              trackTotal={list.tracks.total}
              isPublic={list.public ?? true}
              playlistId={list.id}
              description={list.description}
            />
          );
        })}
      </Tiles>
      {scrollButtons && (
        <ExpandedPlayLists title={title} show={show} onClose={onClose}>
          {playlists.map((list, index) => {
            const isLast = index === playlists.length - 1;
            return (
              <PlaylistCard
                ref={(node) => {
                  isLast && setRef(node);
                }}
                key={list.id}
                uri={list.uri}
                // link={list.external_urls.spotify ?? ''}
                name={list.name}
                image={list.images[0]?.url}
                // tracks={list.tracks.total}
                // public={list.public}
                playlistUri={list.uri}
                description={list.description}
              />
            );
          })}
        </ExpandedPlayLists>
      )}
      <PlaylistDrawer />
    </Stack>
  );
};

export default Playlists;
