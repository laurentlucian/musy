import { FormControl, FormLabel, useRadioGroup, HStack, useColorModeValue } from '@chakra-ui/react';

import { useTypedFetcher } from 'remix-typedjson';

import { RadioButtons } from '~/lib/theme/components/RatingRadio';
import type { action } from '~/routes/api/rateRecommend';

const options = [
  { name: '1', value: '1' },
  { name: '2', value: '2' },
  { name: '3', value: '3' },
  { name: '4', value: '4' },
  { name: '5', value: '5' },
  { name: '6', value: '6' },
  { name: '7', value: '7' },
  { name: '8', value: '8' },
  { name: '9', value: '9' },
  { name: '10', value: '10' },
];

const RecommendRatingForm = ({ rating, sender }: { rating?: string; sender: string }) => {
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.700');
  const fetcher = useTypedFetcher<typeof action>();

  const onChange = (rating: string) => {
    fetcher.submit({ rating }, { action: '/api/rateRecommend', method: 'post', replace: true });
  };

  const { getRadioProps, getRootProps } = useRadioGroup({
    defaultValue: rating ?? '5',
    name: 'rating',
    onChange: (value) => onChange(value),
  });

  const group = getRootProps();

  return (
    <FormControl
      display="flex"
      flexDirection="column"
      gap={['10px', null, '20px']}
      bg={bg}
      color={color}
    >
      <FormLabel htmlFor="tating" mb="0">
        rate {sender}&apos;s recommendation
      </FormLabel>
      <HStack gap={0} {...group} p={0} m={0}>
        {options.map(({ name, value }) => {
          const radio = getRadioProps({ value });
          return (
            <RadioButtons key={value} {...radio} value={value}>
              {name}
            </RadioButtons>
          );
        })}
      </HStack>
    </FormControl>
  );
};
export default RecommendRatingForm;
