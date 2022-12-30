import { Button, Image, Stack } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { useFetcher, useLocation, useParams, useSubmit } from '@remix-run/react';
import { Add, CloseSquare, Send2, TickSquare } from 'iconsax-react';
import useSessionUser from '~/hooks/useSessionUser';
import Waver from '../Waver';

type AddQueueProps = {
  track: {
    trackId: string;

    // this is used by ActivityFeed to let prisma know from who the track is from (who sent, or liked)
    userId?: string;
  };
  user: Profile | null;
};

const AddQueue = ({ track: { trackId, userId }, user }: AddQueueProps) => {
  const { id: paramId } = useParams();
  const currentUser = useSessionUser();
  const submit = useSubmit();
  const fetcher = useFetcher();
  const { pathname, search } = useLocation();
  const isSending = !!user;

  const addToQueue = () => {
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
    const action = isSending ? `/${id}/add` : `/${currentUser.userId}/add`;

    const fromUserId = isSending ? currentUser?.userId : id;
    const sendToUserId = isSending ? id : currentUser?.userId;

    const data = {
      trackId: trackId ?? '',

      fromId: fromUserId ?? '',
      toId: sendToUserId ?? '',
      action: isSending ? 'send' : 'add',
    };

    fetcher.submit(data, { replace: true, method: 'post', action });
  };
  const isAdding = fetcher.submission?.formData.get('trackId') === trackId;

  const isDone = fetcher.type === 'done';
  const isError =
    typeof fetcher.data === 'string'
      ? fetcher.data.includes('Error')
        ? fetcher.data
        : null
      : null;
  const icon = isDone ? (
    <TickSquare size="25px" />
  ) : isError ? (
    <CloseSquare size="25px" />
  ) : user ? (
    <Send2 />
  ) : (
    <Add />
  );

  const qText = isSending ? user?.name.split(/[ .]/)[0] : 'Add to Your Queue';

  const text = isDone ? (typeof fetcher.data === 'string' ? fetcher.data : 'Authenticated') : qText;

  return (
    <>
      {user ? (
        <Stack direction="column">
          <Button
            onClick={addToQueue}
            isDisabled={!!isDone || !!isError || !!isAdding}
            variant="ghost"
            justifyContent="left"
            fontSize="18px"
            py="30px"
            w={['100vw', '550px']}
          >
            <Image
              src={user?.image}
              borderRadius="full"
              boxSize="50px"
              minW="50px"
              mb={1}
              mr="10px"
            />
            {isAdding ? <Waver /> : text}
          </Button>
        </Stack>
      ) : (
        <Stack direction="column">
          <Button
            onClick={addToQueue}
            leftIcon={icon}
            isDisabled={!!isDone || !!isError || !!isAdding}
            variant="ghost"
            justifyContent="left"
            fontSize="14px"
            w={['100vw', '550px']}
          >
            {isAdding && <Waver />}
            {text}
          </Button>
        </Stack>
      )}
    </>
  );
};

export default AddQueue;
