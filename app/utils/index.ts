import { useRef, useEffect, useCallback, useState } from 'react';

export const timeSince = (date: Date) => {
  const now = new Date().getTime();
  const seconds = Math.floor((now - new Date(date).getTime()) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes';
  }
  return Math.floor(seconds) + ' seconds';
};

type scrollBehavior = 'natural' | 'reverse';
export const useHorizontalScroll = (behavior: scrollBehavior) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [clickStartX, setClickStartX] = useState<number | null>(null);
  const [scrollStartX, setScrollStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY == 0) return;
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + e.deltaY,
          // bugs with my mouse's scroll wheel (when too fast)
          // behavior: 'smooth',
        });
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
    }
  }, []);

  const handleDragMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (scrollRef && scrollRef.current) {
        e.preventDefault();
        e.stopPropagation();

        if (clickStartX !== null && scrollStartX !== null && isDragging) {
          const touchDelta = clickStartX - e.screenX;
          scrollRef.current.scrollLeft = behavior === 'natural' ? scrollStartX - touchDelta : scrollStartX + touchDelta;
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
    }
  }, [isDragging]);

  const props = {
    onMouseDown: handleDragStart,
    onMouseMove: handleDragMove,
    onMouseUp: handleDragEnd,
    onMouseLeave: handleDragEnd,
  };

  return { props, scrollRef, clickStartX, scrollStartX, isDragging };
};
