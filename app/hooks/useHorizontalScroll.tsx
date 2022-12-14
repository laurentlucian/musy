import { useInterval } from '@chakra-ui/react';
import { useRef, useEffect, useCallback, useState } from 'react';

type scrollBehavior = 'natural' | 'reverse';
export const useHorizontalScroll = (behavior: scrollBehavior, autoScroll = false) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [clickStartX, setClickStartX] = useState<number | null>(null);
  const [scrollStartX, setScrollStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [navigator] = useState(typeof window !== 'undefined' ? window.navigator : null);
  // disables autoscroll for 2 seconds after user interacts with the scroll
  const hasRecentlyDragged = useRef(false);
  const recentlyDraggedTimeout = useRef<ReturnType<typeof setTimeout>>();

  const isMobile = navigator?.userAgent.match(/iPad|iPhone|iPod/i);

  useInterval(
    () => {
      const el = scrollRef.current;
      if (!el || hasRecentlyDragged.current) return;

      // Check if 'scrollBehavior' is supported
      if ('scrollBehavior' in Element.prototype) {
        // Use 'smooth' scrolling if supported
        el.scrollTo({
          left: el.scrollLeft + 1,
          behavior: 'smooth',
        });
      } else {
        // Fall back to default scrolling behavior if 'smooth' is not supported
        el.scrollTo({
          left: el.scrollLeft + 1,
        });
      }

      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
        if ('scrollBehavior' in Element.prototype) {
          el.scrollTo({
            left: 0,
            behavior: 'smooth',
          });
        } else {
          el.scrollTo({
            left: 0,
          });
        }
      }
    },
    autoScroll ? (isMobile ? 35 : 20) : null,
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY == 0) return;
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + e.deltaY,
          // bugs with my mouse's scroll wheel (when too fast)
          // behavior: 'smooth',
        });

        hasRecentlyDragged.current = true;
        clearTimeout(recentlyDraggedTimeout.current);
        recentlyDraggedTimeout.current = setTimeout(
          () => (hasRecentlyDragged.current = false),
          2000,
        );
      };
      el.addEventListener('wheel', onWheel);
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (scrollRef.current) {
      setClickStartX(e.screenX);
      setScrollStartX(scrollRef.current.scrollLeft);
      setIsDragging(true);

      clearTimeout(recentlyDraggedTimeout.current);
      hasRecentlyDragged.current = true;
    }
  }, []);

  const handleDragMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (scrollRef && scrollRef.current) {
        e.preventDefault();
        e.stopPropagation();

        if (clickStartX !== null && scrollStartX !== null && isDragging) {
          const touchDelta = clickStartX - e.screenX;
          scrollRef.current.scrollLeft =
            behavior === 'natural' ? scrollStartX - touchDelta : scrollStartX + touchDelta;
        }
      }
    },
    [clickStartX, isDragging, scrollStartX, behavior],
  );

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setClickStartX(null);
      setScrollStartX(null);
      setIsDragging(false);

      clearTimeout(recentlyDraggedTimeout.current);
      recentlyDraggedTimeout.current = setTimeout(() => (hasRecentlyDragged.current = false), 2000);
    }
  }, [isDragging]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    clearTimeout(recentlyDraggedTimeout.current);
    hasRecentlyDragged.current = true;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    clearTimeout(recentlyDraggedTimeout.current);
    recentlyDraggedTimeout.current = setTimeout(() => (hasRecentlyDragged.current = false), 2000);
  }, []);

  const props = {
    onMouseDown: handleDragStart,
    onMouseMove: handleDragMove,
    onMouseUp: handleDragEnd,
    onMouseLeave: handleDragEnd,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };

  return { props, scrollRef, clickStartX, scrollStartX, isDragging };
};
