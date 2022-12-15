import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { IconButton, HStack, useMediaQuery } from '@chakra-ui/react';
import { useHorizontalScroll } from '~/hooks/useHorizontalScroll';
import { ArrowLeft2, ArrowRight2, Next, Previous, Smallcaps } from 'iconsax-react';

type TilesProps = {
  children: ReactNode;
  autoScroll?: boolean;
  scrollButtons?: boolean;
};

const Tiles = ({ children, autoScroll, scrollButtons }: TilesProps) => {
  const { scrollRef, props } = useHorizontalScroll('reverse', autoScroll);
  const [isSmallScreen] = useMediaQuery('(max-width: 600px)');
  const buttonRef = useRef(null);
  const scrollPosRef = useRef(0);
  const buttonPressedRef = useRef(false);
  const recentlyPushedButton = useRef<ReturnType<typeof setTimeout>>();

  const offset = isSmallScreen ? 52 : -34;

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

  const scrollToPrevPage = () => {
    buttonPressedRef.current = true;
    if (scrollRef.current && buttonRef.current) {
      if (scrollPosRef.current <= 0) scrollPosRef.current = 0;
      else scrollPosRef.current -= scrollRef.current.clientWidth + offset;
      scrollRef.current.scrollTo({
        left: scrollPosRef.current,
        behavior: 'smooth',
      });
    }

    clearTimeout(recentlyPushedButton.current);
    recentlyPushedButton.current = setTimeout(() => {
      buttonPressedRef.current = false;
    }, 200);
  };
  const scrollToNextPage = () => {
    buttonPressedRef.current = true;
    if (scrollRef.current && buttonRef.current) {
      if (scrollPosRef.current <= 0) scrollPosRef.current = 0;
      if (scrollPosRef.current >= scrollRef.current.scrollWidth - scrollRef.current.clientWidth)
        scrollPosRef.current = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      else scrollPosRef.current += scrollRef.current.clientWidth + offset;
      scrollRef.current.scrollTo({
        left: scrollPosRef.current,
        behavior: 'smooth',
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
    <>
      {scrollButtons && (
        <HStack>
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
      )}
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
    </>
  );
};

export default Tiles;
