import { useLocation, useParams, useSubmit } from '@remix-run/react';

import { Button, Image } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { useTypedFetcher } from 'remix-typedjson';

import { useDrawerTrack } from '~/hooks/useDrawer';
import useSessionUser from '~/hooks/useSessionUser';
import type { action } from '~/routes/api/recommend';

import Waver from '../../icons/Waver';

type RecommendProps = {
  comment?: string;
  user: Profile | null;
  userId?: string;
};

const Recommend = ({ comment, user, userId }: RecommendProps) => {
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
        action: '/auth/spotify?returnTo=' + pathname + search,
        method: 'post',
        replace: true,
      });
    }

    const id = userId || user?.userId || paramId;
    const action = `/${id}/recommend`;

    const fromUserId = currentUser?.userId;
    const sendToUserId = id;

    const data = {
      action: 'recommend',
      albumName: track?.albumName ?? '',
      albumUri: track?.albumUri ?? '',
      artist: track?.artist ?? '',
      artistUri: track?.artistUri ?? '',
      comment: comment ?? ``,
      explicit: track?.explicit ? 'true' : '',
      fromId: fromUserId ?? '',
      image: track?.image ?? '',
      link: track?.link ?? '',
      name: track?.name ?? '',
      preview_url: track?.preview_url ?? '',

      toId: sendToUserId ?? '',
      trackId: track?.id ?? '',
      uri: track?.uri ?? '',
    };

    fetcher.submit(data, { action, method: 'post', replace: true });
  };
  const isAdding = fetcher.submission?.formData.get('trackId') === track?.id;

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
