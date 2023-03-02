import { Form, useSearchParams, useSubmit, useParams } from '@remix-run/react';
import { useCallback, useState } from 'react';

import { Box, HStack, SimpleGrid, Stack, useRadioGroup } from '@chakra-ui/react';

import { RadioCard } from '~/lib/theme/components/Radio';
import type { Track } from '~/lib/types/types';

import ExpandedSongs from '../profile/ExpandedSongs';
import Tile from '../Tile';
import Card from './Card';
import Tiles from './Tiles';

const TopTracks = ({ top }: { top: SpotifyApi.TrackObjectFull[] }) => {
  const [layout, setLayout] = useState(true);
  const [show, setShow] = useState(false);
  const submit = useSubmit();
  const [params] = useSearchParams();
  const { id } = useParams();
  const topFilter = params.get('top-filter') ?? 'medium_term';

  const options = [
    { name: 'All', value: 'long_term' },
    { name: '6 mo', value: 'medium_term' },
    { name: '1 mo', value: 'short_term' },
  ];

  const { getRadioProps, getRootProps } = useRadioGroup({
    defaultValue: topFilter,
    name: 'top-filter',
  });

  const group = getRootProps();

  const Filter = (
    <Form
      method="get"
      onChange={(e) => {
        submit(e.currentTarget, { preventScrollReset: true, replace: true });
      }}
    >
      <HStack spacing={4} {...group} p={0} m={0}>
        {options.map(({ name, value }) => {
          const radio = getRadioProps({ value });
          return (
            <RadioCard key={value} {...radio} value={value}>
              {name}
            </RadioCard>
          );
        })}
      </HStack>
    </Form>
  );

  const scrollButtons = top.length > 5;
  const title = 'Top';

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const tracks: Track[] = [];
  for (let i = 0; i < top.length; i++) {
    const track = {
      albumName: top[i].album.name,
      albumUri: top[i].album.uri,
      artist: top[i].artists[0].name,
      artistUri: top[i].artists[0].uri,
      duration: top[i].duration_ms,
      explicit: top[i].explicit,
      id: top[i].id,
      image: top[i].album.images[0]?.url,
      link: top[i].external_urls.spotify,
      name: top[i].name,
      preview_url: top[i].preview_url,
      uri: top[i].uri,
    };
    tracks.push(track);
  }

  if (!top.length) return null;

  return (
    <Stack spacing={3} pb={top.length === 0 ? '250px' : '0px'}>
      <Tiles title={title} scrollButtons={scrollButtons} Filter={Filter} setShow={setShow}>
        {top.map((track) => {
          return (
            <Tile
              key={track.id}
              layoutKey="Top"
              track={{
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
              }}
              profileId={id ?? ''}
              tracks={tracks}
            />
          );
        })}
      </Tiles>
      <ExpandedSongs
        title={title}
        show={show}
        onClose={onClose}
        Filter={Filter}
        setLayout={setLayout}
        layout={layout}
      >
        {layout ? (
          <SimpleGrid
            minChildWidth={['115px', '100px']}
            spacing="10px"
            w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}
          >
            {top.map((track, index) => {
              return (
                <Box key={track.id}>
                  <Tile
                    layoutKey="TopExpanded"
                    track={{
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
                    }}
                    tracks={tracks}
                    index={index}
                    profileId={id ?? ''}
                    w={['115px', '100px']}
                  />
                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          top.map((track, index) => {
            return (
              <Card
                key={track.id}
                layoutKey="TopCard"
                track={{
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
                }}
                tracks={tracks}
                index={index}
                userId={id ?? ''}
              />
            );
          })
        )}
      </ExpandedSongs>
    </Stack>
  );
};

export default TopTracks;
