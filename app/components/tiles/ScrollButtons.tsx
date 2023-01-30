import { useEffect, useRef } from 'react';
import { ChevronsLeft, ChevronLeft, ChevronsRight, ChevronRight } from 'react-feather';

import { IconButton, HStack } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';

const ScrollButtons = ({
  scrollRef,
}: {
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
}) => {
  const scrollPosRef = useRef(0);
  const buttonPressedRef = useRef(false);
  const recentlyPushedButton = useRef<ReturnType<typeof setTimeout>>();
  const isSmallScreen = useIsMobile();

  const offset = isSmallScreen ? 52 : -34;

  const scrollToEnd = () => {
    if (scrollRef.current) {
      scrollPosRef.current = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        behavior: 'smooth',
        left: scrollPosRef.current,
      });
    }
  };
  const scrollToStart = () => {
    if (scrollRef.current) {
      scrollPosRef.current = -scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        behavior: 'smooth',
        left: scrollPosRef.current,
      });
    }
  };

  const scrollToPrevPage = () => {
    buttonPressedRef.current = true;
    if (scrollRef.current) {
      if (scrollPosRef.current <= 0) scrollPosRef.current = 0;
      else scrollPosRef.current -= scrollRef.current.clientWidth + offset;
      scrollRef.current.scrollTo({
        behavior: 'smooth',
        left: scrollPosRef.current,
      });
    }

    clearTimeout(recentlyPushedButton.current);
    recentlyPushedButton.current = setTimeout(() => {
      buttonPressedRef.current = false;
    }, 200);
  };
  const scrollToNextPage = () => {
    buttonPressedRef.current = true;
    if (scrollRef.current) {
      if (scrollPosRef.current <= 0) scrollPosRef.current = 0;
      if (scrollPosRef.current >= scrollRef.current.scrollWidth - scrollRef.current.clientWidth)
        scrollPosRef.current = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      else scrollPosRef.current += scrollRef.current.clientWidth + offset;
      scrollRef.current.scrollTo({
        behavior: 'smooth',
        left: scrollPosRef.current,
      });
    }

    clearTimeout(recentlyPushedButton.current);
    recentlyPushedButton.current = setTimeout(() => {
      buttonPressedRef.current = false;
    }, 200);
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (!ref) return;

    const syncScroll = () => {
      if (buttonPressedRef.current) return;
      scrollPosRef.current = ref.scrollLeft;
    };
    ref.addEventListener('scroll', syncScroll);
    return () => {
      ref.removeEventListener('scroll', syncScroll);
    };
  }, [scrollRef]);

  return (
    <HStack ml="auto !important">
      <HStack>
        <IconButton
          onClick={scrollToStart}
          variant="ghost"
          icon={<ChevronsLeft size="18px" />}
          aria-label="to start"
          _hover={{ color: 'spotify.green', opacity: 1 }}
          opacity={0.5}
          _active={{ boxShadow: 'none' }}
        />

        <IconButton
          onClick={scrollToPrevPage}
          variant="ghost"
          icon={<ChevronLeft size="18px" />}
          aria-label="previous page"
          _hover={{ color: 'spotify.green', opacity: 1 }}
          opacity={0.5}
          _active={{ boxShadow: 'none' }}
        />
      </HStack>

      <HStack>
        <IconButton
          onClick={scrollToNextPage}
          variant="ghost"
          icon={<ChevronRight size="18px" />}
          aria-label="next page"
          _hover={{ color: 'spotify.green', opacity: 1 }}
          opacity={0.5}
          _active={{ boxShadow: 'none' }}
        />

        <IconButton
          onClick={scrollToEnd}
          variant="ghost"
          icon={<ChevronsRight size="18px" />}
          aria-label="to end"
          _hover={{ color: 'spotify.green', opacity: 1 }}
          opacity={0.5}
          _active={{ boxShadow: 'none' }}
        />
      </HStack>
    </HStack>
  );
};

export default ScrollButtons;
