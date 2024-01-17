import { Element3, TextalignJustifycenter } from "iconsax-react";

import { useFullscreenTracks } from "./FullscreenTracks";

const FullscreenTracksHeader = () => {
  const { layout, setLayout, title } = useFullscreenTracks();

  return (
    <div className="stack-h-3 px-1 py-8 md:px-0">
      <p className="text-lg">{title}</p>
      <button
        aria-label="switch layouts"
        onClick={() => setLayout((prev) => (prev === "grid" ? "list" : "grid"))}
        tabIndex={-1}
        color="musy.200"
      >
        {layout === "list" ? <Element3 /> : <TextalignJustifycenter />}
      </button>
    </div>
  );
};

export default FullscreenTracksHeader;
