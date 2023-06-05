import FullscreenFadeLayout from '../../shared/FullscreenFadeLayout';
import CommentInput from './comments/CommentInput';
import CommentList from './comments/CommentList';
import BackButton from './shared/BackButton';

const FullscreenTrackComments = () => (
  <FullscreenFadeLayout>
    <BackButton />
    <CommentList />
    <CommentInput />
  </FullscreenFadeLayout>
);

export default FullscreenTrackComments;
