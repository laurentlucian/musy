import { useLocation, useParams, useSubmit } from '@remix-run/react';
import useSessionUser from '~/hooks/useSessionUser';
import { useDrawerTrack } from '~/hooks/useDrawer';
import { useTypedFetcher } from 'remix-typedjson';
import { Button, Image } from '@chakra-ui/react';
import type { action } from '~/routes/$id/add';
import type { Profile } from '@prisma/client';
import Waver from '../Waver';

type RecommendProps = {
  userId?: string;
  user: Profile | null;
  comment?: string;
};

const Recommend = ({ userId, user, comment }: RecommendProps) => {
  const { id: paramId } = useParams();
  const currentUser = useSessionUser();
  const submit = useSubmit();
  const fetcher = useTypedFetcher<typeof action>();
  const { pathname, search } = useLocation();
  const track = useDrawerTrack();

  const addToRecommended = () => {
    if (!currentUser) {
      // @todo figure out a better way to require authentication on click;
      // after authentication redirect, add to queue isn't successful. user needs to click again
      return submit(null, {
        replace: true,
        method: 'post',
        action: '/auth/spotify?returnTo=' + pathname + search,
      });
    }

    const id = userId || user?.userId || paramId;
    const action = `/${id}/recommend`;

    const fromUserId = currentUser?.userId;
    const sendToUserId = id;

    const data = {
      comment: comment ?? ``,
      trackId: track?.trackId ?? '',
      uri: track?.uri ?? '',
      name: track?.name ?? '',
      image: track?.image ?? '',
      albumUri: track?.albumUri ?? '',
      albumName: track?.albumName ?? '',
      artist: track?.artist ?? '',
      artistUri: track?.artistUri ?? '',
      explicit: track?.explicit ? 'true' : '',
      preview_url: track?.preview_url ?? '',
      link: track?.link ?? '',

      fromId: fromUserId ?? '',
      toId: sendToUserId ?? '',
      action: 'recommend',
    };

    fetcher.submit(data, { replace: true, method: 'post', action });
  };
  const isAdding = fetcher.submission?.formData.get('trackId') === track?.trackId;

  const isDone = fetcher.type === 'done';
  const isError =
    typeof fetcher.data === 'string'
      ? fetcher.data.includes('Error')
        ? fetcher.data
        : null
      : null;

  const qText = user?.name.split(/[ .]/)[0];

  const text = isDone ? (typeof fetcher.data === 'string' ? fetcher.data : 'Authenticated') : qText;

  return (
    <>
      <Button
        onClick={addToRecommended}
        isDisabled={!!isDone || !!isError || !!isAdding}
        variant="ghost"
        justifyContent="left"
        fontSize="18px"
        py="30px"
        w={['100vw', '550px']}
        mt="10px"
      >
        <Image src={user?.image} borderRadius="full" boxSize="50px" minW="50px" mb={1} mr="10px" />
        {isAdding ? <Waver /> : text}
      </Button>
    </>
  );
};

export default Recommend;
