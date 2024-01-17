import SearchInput from "~/components/search/SearchInput";

import FullscreenFadeLayout from "../shared/FullscreenFadeLayout";
import FullscreenQueueTracks from "./FullscreenQueueTracks";

const FullscreenQueue = (props: { userId: string }) => {
  return (
    <FullscreenFadeLayout>
      <div className="stack-3 w-full items-center" id="dont-close">
        <SearchInput
          className="mt-1 shrink-0 md:mt-3 md:max-w-[800px] lg:mt-12"
          param="fullscreen"
          autoFocus
        />
        <div className="w-full overflow-x-hidden">
          <FullscreenQueueTracks userId={props.userId} />
        </div>
      </div>
    </FullscreenFadeLayout>
  );
};

export default FullscreenQueue;
