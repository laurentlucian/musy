import { useEffect } from "react";

const useVisibilityChange = (callback: (isVisible: boolean) => void) => {
  useEffect(() => {
    let lastCallbackTimestamp = 0;

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (now - lastCallbackTimestamp > 1000) {
        callback(document.visibilityState === "visible");
        lastCallbackTimestamp = now;
      }
    };

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastCallbackTimestamp > 1000) {
        callback(true);
        lastCallbackTimestamp = now;
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [callback]);
};

export default useVisibilityChange;
