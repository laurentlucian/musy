import AddToSelf from '../../shared/actions/AddToSelf';
import AnalyzeTrack from '../../shared/actions/Analyze';
import CopyLink from '../../shared/actions/CopyLink';
import Recommend from '../../shared/actions/Recommend';
import SaveToLiked from '../../shared/actions/SaveToLiked';
import FullscreenFadeLayout from '../../shared/FullscreenFadeLayout';
import { useFullscreenTrack } from '../FullscreenTrack';
import Comment from './actions/Comment';
import PlayPreview from './actions/PlayPreview';
import SendToFriends from './actions/SendToFriends';

const FullscreenTrackActions = () => {
  const { originUserId, track } = useFullscreenTrack();

  return (
    <FullscreenFadeLayout overflowX="hidden" direction="column">
      <SaveToLiked trackId={track.id} />
      <Recommend trackId={track.id} />
      {/* <Comment /> */}
      <AddToSelf withIcon trackId={track.id} originUserId={originUserId} />
      <SendToFriends />
      <PlayPreview />
      <AnalyzeTrack trackId={track.id} />
      <CopyLink trackLink={track.link} />
    </FullscreenFadeLayout>
  );
};

export default FullscreenTrackActions;
