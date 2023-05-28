import { Form, useSearchParams, useSubmit } from '@remix-run/react';

import { HStack, useRadioGroup } from '@chakra-ui/react';

import { RadioCard } from '~/lib/theme/components/Radio';
import type { TrackWithInfo } from '~/lib/types/types';

import TrackTiles from './TrackTiles';

const options = [
  { name: 'All', value: 'long_term' },
  { name: '6 mo', value: 'medium_term' },
  { name: '1 mo', value: 'short_term' },
];

const TopTiles = ({ tracks }: { tracks: TrackWithInfo[] }) => {
  const submit = useSubmit();
  const [params] = useSearchParams();
  const topFilter = params.get('top-filter') ?? 'medium_term';

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
      <HStack spacing={4} {...group} p={0} m={0} ml={4}>
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

  if (!tracks.length) return null;

  return <TrackTiles tracks={tracks} title="TOP" actions={{ tiles: Filter }} />;
};

export default TopTiles;