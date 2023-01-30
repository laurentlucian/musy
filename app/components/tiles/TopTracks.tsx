import { Form, useSearchParams, useSubmit } from '@remix-run/react';
import { HStack, Stack, useRadioGroup } from '@chakra-ui/react';
import { RadioCard } from '~/lib/theme/components/Radio';
import ExpandedSongs from '../profile/ExpandedSongs';
import { useCallback, useState } from 'react';
import Tiles from './Tiles';
import Tile from '../Tile';
import Card from './Card';

const TopTracks = ({ top }: { top: SpotifyApi.TrackObjectFull[] }) => {
  const [show, setShow] = useState(false);
  const submit = useSubmit();
  const [params] = useSearchParams();
  const topFilter = params.get('top-filter') ?? 'medium_term';

  const options = [
    { name: 'All', value: 'long_term' },
    { name: '6 mo', value: 'medium_term' },
    { name: '1 mo', value: 'short_term' },
  ];

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'top-filter',
    defaultValue: topFilter,
  });

  const group = getRootProps();

  const Filter = (
    <Form
      method="get"
      onChange={(e) => {
        submit(e.currentTarget, { replace: true });
      }}
    >
      <HStack spacing={4} {...group} p={0} m={0}>
        {options.map(({ value, name }) => {
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

  return (
    <Stack spacing={3} pb={top.length === 0 ? '250px' : '0px'}>
      <Tiles title={title} scrollButtons={scrollButtons} Filter={Filter} setShow={setShow}>
        {top.map((track) => {
          return (
            <Tile
              key={track.id}
              uri={track.uri}
              trackId={track.id}
              image={track.album.images[1].url}
              albumUri={track.album.uri}
              albumName={track.album.name}
              name={track.name}
              artist={track.album.artists[0].name}
              artistUri={track.album.artists[0].uri}
              explicit={track.explicit}
              preview_url={track.preview_url}
              link={track.external_urls.spotify}
            />
          );
        })}
      </Tiles>
      <ExpandedSongs title={title} show={show} onClose={onClose} Filter={Filter}>
        {top.map((track) => {
          return (
            <Card
              key={track.id}
              uri={track.uri}
              trackId={track.id}
              image={track.album.images[1].url}
              albumUri={track.album.uri}
              albumName={track.album.name}
              name={track.name}
              artist={track.album.artists[0].name}
              artistUri={track.album.artists[0].uri}
              explicit={track.explicit}
              preview_url={track.preview_url}
              link={track.external_urls.spotify}
            />
          );
        })}
      </ExpandedSongs>
    </Stack>
  );
};

export default TopTracks;
