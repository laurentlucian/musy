import { useEffect } from "react";

function useDrawerBackButton(onClose: () => void, isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // Add a fake history event so that the back button does nothing if pressed once
      window.history.pushState("drawer", document.title, window.location.href);

      addEventListener("popstate", onClose);

      // Here is the cleanup when this component unmounts
      return () => {
        removeEventListener("popstate", onClose);
        // If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
        if (window.history.state === "drawer") {
          window.history.back();
        }
      };
    }
  }, [isOpen, onClose]);
}

export default useDrawerBackButton;
