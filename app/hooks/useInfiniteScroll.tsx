import { useEffect, useRef } from 'react';

import { Flex } from '@chakra-ui/react';

import Waver from '~/lib/icons/Waver';

import useIntersectionObserver from './useIntersectionObserver';

const useInfiniteScroll = (callback: () => void, isFetching: boolean, margin: number) => {
  const ref = useRef<HTMLDivElement>(null);

  const entry = useIntersectionObserver(ref, {
    rootMargin: `0px 0px ${margin}px 0px`,
  });
  const isVisible = !!entry?.isIntersecting;

  useEffect(() => {
    if (!isVisible) return;
    callback();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const waver = (
    <Flex justify="center" h="50px" ref={ref}>
      {isFetching && <Waver />}
    </Flex>
  );

  return { waver };
};

export default useInfiniteScroll;
