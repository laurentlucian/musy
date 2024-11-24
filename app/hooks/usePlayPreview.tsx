import { useEffect, useRef } from "react";

import { createWithEqualityFn } from "zustand/traditional";

type PlayPreviewStore = {
  preview: string | null;
};

const usePlayPreviewStore = createWithEqualityFn<PlayPreviewStore>(() => ({
  preview: null,
}));

const setPlayPreviewStore = usePlayPreviewStore.setState;

export const usePlayPreview = (url: string | null) => {
  const { preview } = usePlayPreviewStore();

  const play = () => {
    setPlayPreviewStore(() => ({ preview: url }));
  };

  const stop = () => {
    setPlayPreviewStore(() => ({ preview: null }));
  };

  const isPlaying = preview === url;

  const onClick = () => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  };

  return {
    isPlaying,
    onClick,
  };
};

export const PlayPreviewRenderer = () => {
  const { preview } = usePlayPreviewStore();
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = ref.current;
    if (audio) {
      audio.volume = 0.05;
      audio.addEventListener("ended", () =>
        setPlayPreviewStore(() => ({ preview: null })),
      );
      return () => {
        audio.removeEventListener("ended", () =>
          setPlayPreviewStore(() => ({ preview: null })),
        );
      };
    }
  }, [preview]);

  if (!preview) return null;

  return <audio ref={ref} src={preview} autoPlay />;
};
