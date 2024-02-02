import { useRef, useEffect, useCallback, useState } from 'react';

import { useInterval } from 'ahooks';

type scrollBehavior = 'natural' | 'reverse';
export const useMouseScroll = (behavior: scrollBehavior, autoScroll = false) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [clickStartX, setClickStartX] = useState<number | null>(null);
  const [clickStartY, setClickStartY] = useState<number | null>(null);
  const [scrollStartX, setScrollStartX] = useState<number | null>(null);
  const [scrollStartY, setScrollStartY] = useState<number | null>(null);
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
          behavior: 'smooth',
          left: el.scrollLeft + 1,
          top: el.scrollTop + 1,
        });
      } else {
        // Fall back to default scrolling behavior if 'smooth' is not supported
        el.scrollTo({
          left: el.scrollLeft + 1,
          top: el.scrollTop + 1,
        });
      }

      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
        if ('scrollBehavior' in Element.prototype) {
          el.scrollTo({
            behavior: 'smooth',
            left: 0,
          });
        } else {
          el.scrollTo({
            left: 0,
          });
        }
      }
      if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
        if ('scrollBehavior' in Element.prototype) {
          el.scrollTo({
            behavior: 'smooth',
            top: 0,
          });
        } else {
          el.scrollTo({
            top: 0,
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
        if (e.deltaY === 0) return;
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
      setClickStartY(e.screenY);
      setScrollStartX(scrollRef.current.scrollLeft);
      setScrollStartY(scrollRef.current.scrollTop);
      setIsDragging(true);

      clearTimeout(recentlyDraggedTimeout.current);
      hasRecentlyDragged.current = true;
    }
  }, []);

  const handleDragMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (scrollRef?.current) {
        e.preventDefault();
        e.stopPropagation();

        if (clickStartX !== null && scrollStartX !== null && isDragging) {
          const touchDelta = clickStartX - e.screenX;
          scrollRef.current.scrollLeft =
            behavior === 'natural' ? scrollStartX - touchDelta : scrollStartX + touchDelta;
        }
        if (clickStartY !== null && scrollStartY !== null && isDragging) {
          const touchDelta = clickStartY - e.screenY;
          scrollRef.current.scrollTop =
            behavior === 'natural' ? scrollStartY - touchDelta : scrollStartY + touchDelta;
        }
      }
    },
    [clickStartX, clickStartY, isDragging, scrollStartX, scrollStartY, behavior],
  );

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setClickStartX(null);
      setClickStartY(null);
      setScrollStartX(null);
      setScrollStartY(null);
      setIsDragging(false);

      clearTimeout(recentlyDraggedTimeout.current);
      recentlyDraggedTimeout.current = setTimeout(() => (hasRecentlyDragged.current = false), 2000);
    }
  }, [isDragging]);

  const handleTouchStart = useCallback(() => {
    clearTimeout(recentlyDraggedTimeout.current);
    hasRecentlyDragged.current = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    clearTimeout(recentlyDraggedTimeout.current);
    recentlyDraggedTimeout.current = setTimeout(() => (hasRecentlyDragged.current = false), 2000);
  }, []);

  const props = {
    onMouseDown: handleDragStart,
    onMouseLeave: handleDragEnd,
    onMouseMove: handleDragMove,
    onMouseUp: handleDragEnd,
    onTouchEnd: handleTouchEnd,
    onTouchStart: handleTouchStart,
  };

  return { clickStartX, isDragging, props, scrollRef, scrollStartX };
};
