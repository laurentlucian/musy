import { useEffect, useRef } from "react";

import Waver from "~/lib/icons/Waver";

import useIntersectionObserver from "./useIntersectionObserver";

const useInfiniteScroll = (
  callback: () => void,
  isFetching: boolean,
  margin: number,
) => {
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
    <div className="flex h-12 justify-center" ref={ref}>
      {isFetching && <Waver />}
    </div>
  );

  return { waver };
};

export default useInfiniteScroll;
