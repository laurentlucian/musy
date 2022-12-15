import { IconButton, HStack } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useHorizontalScroll } from '~/hooks/useHorizontalScroll';
import { ArrowLeft2, ArrowRight2, Next, Previous } from 'iconsax-react';

type TilesProps = {
  children: ReactNode;
  autoScroll?: boolean;
};

const Tiles = ({ children, autoScroll }: TilesProps) => {
  const { scrollRef, props } = useHorizontalScroll('reverse', autoScroll);
  const buttonRef = useRef(null);
  const scrollPosRef = useRef(0);
  const wheelScrollRef = useRef(0);
  const scrollToEnd = () => {
    if (scrollRef.current && buttonRef.current) {
      scrollPosRef.current = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: scrollPosRef.current,
        behavior: 'smooth',
      });
    }
  };
  const scrollToStart = () => {
    if (scrollRef.current && buttonRef.current) {
      scrollPosRef.current = -scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: scrollPosRef.current,
        behavior: 'smooth',
      });
    }
  };
  const scrollToNextPage = () => {
    if (scrollRef.current && buttonRef.current) {
      if (scrollPosRef.current <= 0) scrollPosRef.current = 0;
      if (scrollPosRef.current >= scrollRef.current.scrollWidth - scrollRef.current.clientWidth)
        scrollPosRef.current = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      else if (wheelScrollRef.current > scrollPosRef.current)
        scrollPosRef.current = wheelScrollRef.current;
      scrollPosRef.current += scrollRef.current.clientWidth - 34;
      console.log(scrollPosRef.current);
      scrollRef.current.scrollTo({
        left: scrollPosRef.current,
        behavior: 'smooth',
      });
    }
  };
  const scrollToPrevPage = () => {
    if (scrollRef.current && buttonRef.current) {
      if (wheelScrollRef.current > scrollPosRef.current)
        scrollPosRef.current = wheelScrollRef.current;
      if (scrollPosRef.current <= 0) scrollPosRef.current = 0;
      else scrollPosRef.current -= scrollRef.current.clientWidth - 34;
      console.log(scrollPosRef.current);
      scrollRef.current.scrollTo({
        left: scrollPosRef.current,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const syncScroll = () => {
      if (!scrollRef.current) return;
      wheelScrollRef.current = scrollRef.current.scrollLeft;
    };
    scrollRef.current?.addEventListener('scroll', syncScroll);
    return () => {
      scrollRef.current?.removeEventListener('scroll', syncScroll);
    };
  }, [scrollRef]);

  return (
    <>
      <HStack
        ref={scrollRef}
        className="scrollbar"
        overflow="auto"
        align="flex-start"
        pb={2}
        {...props}
      >
        {children}
      </HStack>
      <HStack justify="center">
        <HStack>
          <IconButton
            ref={buttonRef}
            onClick={scrollToStart}
            variant="ghost"
            icon={<Previous />}
            aria-label="to start"
          >
            bye
          </IconButton>
          <IconButton
            ref={buttonRef}
            onClick={scrollToPrevPage}
            variant="ghost"
            icon={<ArrowLeft2 />}
            aria-label="previous page"
          >
            bye
          </IconButton>
        </HStack>
        <HStack>
          <IconButton
            ref={buttonRef}
            onClick={scrollToNextPage}
            variant="ghost"
            icon={<ArrowRight2 />}
            aria-label="next page"
          >
            hi
          </IconButton>
          <IconButton
            ref={buttonRef}
            onClick={scrollToEnd}
            variant="ghost"
            icon={<Next />}
            aria-label="to end"
          >
            hi
          </IconButton>
        </HStack>
      </HStack>
    </>
  );
};

export default Tiles;
