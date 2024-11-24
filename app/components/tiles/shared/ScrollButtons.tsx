import { useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "react-feather";

import useIsMobile from "~/hooks/useIsMobile";

const ScrollButtons = ({
  scrollRef,
}: {
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
}) => {
  const scrollPosRef = useRef(0);
  const buttonPressedRef = useRef(false);
  const recentlyPushedButton = useRef<ReturnType<typeof setTimeout>>();
  const isSmallScreen = useIsMobile();

  const offset = isSmallScreen ? 36 : -60;

  const scrollToEnd = () => {
    if (scrollRef.current) {
      scrollPosRef.current =
        scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        behavior: "smooth",
        left: scrollPosRef.current,
      });
    }
  };
  const scrollToStart = () => {
    if (scrollRef.current) {
      scrollPosRef.current =
        -scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        behavior: "smooth",
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
        behavior: "smooth",
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
      if (
        scrollPosRef.current >=
        scrollRef.current.scrollWidth - scrollRef.current.clientWidth
      )
        scrollPosRef.current =
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      else scrollPosRef.current += scrollRef.current.clientWidth + offset;
      scrollRef.current.scrollTo({
        behavior: "smooth",
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
    ref.addEventListener("scroll", syncScroll);
    return () => {
      ref.removeEventListener("scroll", syncScroll);
    };
  }, [scrollRef]);

  return (
    <div className="ml-auto flex space-x-7">
      <button onClick={scrollToStart}>
        <ChevronsLeft size="14px" className="opacity-50 hover:opacity-100" />
      </button>
      <button onClick={scrollToPrevPage}>
        <ChevronLeft size="14px" className="opacity-50 hover:opacity-100" />
      </button>
      <button onClick={scrollToNextPage}>
        <ChevronRight size="14px" className="opacity-50 hover:opacity-100" />
      </button>
      <button onClick={scrollToEnd}>
        <ChevronsRight size="14px" className="opacity-50 hover:opacity-100" />
      </button>
    </div>
  );
};

export default ScrollButtons;
