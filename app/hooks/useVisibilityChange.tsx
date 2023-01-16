import { useEffect } from 'react';

const useVisibilityChange = (callback: (isVisible: boolean) => void) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      callback(document.visibilityState === 'visible');
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [callback]);
};

export default useVisibilityChange;
