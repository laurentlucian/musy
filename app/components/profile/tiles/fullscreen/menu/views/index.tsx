import { type Dispatch, type SetStateAction } from 'react';

import type { TrackWithInfo } from '~/lib/types/types';

import AnalyzeTrack from '../actions/AnalyzeTrack';
import Comment from '../actions/Comment';
import CopyLink from '../actions/CopyLink';
import PlayPreview from '../actions/PlayPreview';
import AddToFriend from '../actions/queue/AddToFriend';
import AddToSelf from '../actions/queue/AddToSelf';
import Recommend from '../actions/Recommend';
import SaveToLiked from '../actions/SaveToLiked';
import { default as CommmentsView } from './Comments';
import QueueList from './QueueList';
import FadeLayout from './shared/FadeLayout';

const Default = ({
  track,
  ...props
}: {
  play: { playing: boolean; setPlaying: Dispatch<SetStateAction<boolean>> };
  track: TrackWithInfo;
}) => {
  return (
    <FadeLayout>
      <SaveToLiked trackId={track.id} />
      <Recommend />
      <Comment />
      <AddToSelf withIcon trackId={track.id} />
      <AddToFriend />
      <AnalyzeTrack trackId={track.id} />
      <CopyLink link={track.link} />
      <PlayPreview
        playing={props.play.playing}
        setPlaying={props.play.setPlaying}
        preview_url={track.preview_url}
      />
    </FadeLayout>
  );
};

const Views = {
  Comments: CommmentsView,
  Default,
  QueueList,
};

export default Views;
