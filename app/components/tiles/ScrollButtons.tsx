import { useEffect, useRef } from 'react';
import { IconButton, HStack, useMediaQuery } from '@chakra-ui/react';
import { ArrowLeft2, ArrowRight2, Next, Previous } from 'iconsax-react';

const ScrollButtons = ({
  scrollRef,
}: {
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
}) => {
  const buttonRef = useRef(null);
  const scrollPosRef = useRef(0);
  const buttonPressedRef = useRef(false);
  const recentlyPushedButton = useRef<ReturnType<typeof setTimeout>>();
  const [isSmallScreen] = useMediaQuery('(max-width: 600px)');

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
    <HStack ml="auto !important">
      <HStack>
        <IconButton
          ref={buttonRef}
          onClick={scrollToStart}
          variant="ghost"
          icon={<Previous size="15px" />}
          aria-label="to start"
          _hover={{ opacity: 1, color: 'spotify.green' }}
          opacity={0.5}
          _active={{ boxShadow: 'none' }}
        />

        <IconButton
          ref={buttonRef}
          onClick={scrollToPrevPage}
          variant="ghost"
          icon={<ArrowLeft2 size="15px" />}
          aria-label="previous page"
          _hover={{ opacity: 1, color: 'spotify.green' }}
          opacity={0.5}
          _active={{ boxShadow: 'none' }}
        />
      </HStack>

      <HStack>
        <IconButton
          ref={buttonRef}
          onClick={scrollToNextPage}
          variant="ghost"
          icon={<ArrowRight2 size="15px" />}
          aria-label="next page"
          _hover={{ opacity: 1, color: 'spotify.green' }}
          opacity={0.5}
          _active={{ boxShadow: 'none' }}
        />

        <IconButton
          ref={buttonRef}
          onClick={scrollToEnd}
          variant="ghost"
          icon={<Next size="15px" />}
          aria-label="to end"
          _hover={{ opacity: 1, color: 'spotify.green' }}
          opacity={0.5}
          _active={{ boxShadow: 'none' }}
        />
      </HStack>
    </HStack>
  );
};

export default ScrollButtons;
