import { useFullscreenTrack } from '../FullscreenTrack';
import AddToFriend from './actions/AddToFriend';
import AnalyzeTrack from './actions/Analyze';
import Comment from './actions/Comment';
import CopyLink from './actions/CopyLink';
import AddToSelf from './actions/queue/AddToSelf';
import Recommend from './actions/Recommend';
import SaveToLiked from './actions/SaveToLiked';
import FadeLayout from './shared/FadeLayout';

const Actions = () => {
  const { track } = useFullscreenTrack();

  return (
    <FadeLayout>
      <SaveToLiked trackId={track.id} />
      <Recommend />
      <Comment />
      <AddToSelf withIcon />
      <AddToFriend />
      <AnalyzeTrack />
      <CopyLink />
      {/* <PlayPreview
        playing={props.play.playing}
        setPlaying={props.play.setPlaying}
        preview_url={track.preview_url}
      /> */}
    </FadeLayout>
  );
};

export default Actions;
