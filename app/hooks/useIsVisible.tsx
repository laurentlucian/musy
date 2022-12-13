import { useEffect, useState } from 'react';

const useIsVisible = (elementRef: React.RefObject<Element>) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = elementRef?.current; // DOM Ref

    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsVisible(entry.isIntersecting);
      });
    });
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [elementRef]);

  return isVisible;
};

export default useIsVisible;
