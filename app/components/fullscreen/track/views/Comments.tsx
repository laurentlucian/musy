import CommentInput from './comments/CommentInput';
import CommentList from './comments/CommentList';
import BackButton from './shared/BackButton';
import FadeLayout from './shared/FadeLayout';

const Comments = () => (
  <FadeLayout>
    <BackButton />
    <CommentList />
    <CommentInput />
  </FadeLayout>
);

export default Comments;
