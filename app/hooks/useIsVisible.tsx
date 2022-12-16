import { useEffect, useState } from 'react';

const useIsVisible = (node: HTMLDivElement | null) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [node]);

  return isVisible;
};

export default useIsVisible;
