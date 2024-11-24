import { useCallback, useRef, useState } from "react";

const useIsVisible = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const intersection = useRef<IntersectionObserver>();
  const [isVisible, setIsVisible] = useState(false);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    let observer = intersection.current;
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsVisible(entry.isIntersecting);
          });
        },
        { threshold: 0 },
      );
      intersection.current = observer;
    }

    if (ref.current) {
      observer.unobserve(ref.current);
    }
    if (node) {
      observer.observe(node);
    }
    ref.current = node;
  }, []);

  return [setRef, isVisible] as const;
};

export default useIsVisible;
