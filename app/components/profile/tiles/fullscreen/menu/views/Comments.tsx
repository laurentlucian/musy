import type { TrackWithInfo } from '~/lib/types/types';

import CommentInput from './comments/CommentInput';
import CommentList from './comments/CommentList';
import BackButton from './shared/BackButton';
import FadeLayout from './shared/FadeLayout';

const Comments = (props: { track: TrackWithInfo }) => {
  console.log('track', props.track);
  return (
    <FadeLayout>
      <BackButton />
      <CommentList />
      <CommentInput />
    </FadeLayout>
  );
};

export default Comments;
