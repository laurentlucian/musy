import { Button, Image, MenuItem } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { useFetcher, useLocation, useParams, useSubmit } from '@remix-run/react';
import { Add, CloseSquare, Send2, TickSquare } from 'iconsax-react';
import useSessionUser from '~/hooks/useSessionUser';
import Waver from '../Waver';

type AddQueueProps = {
  track: {
    trackId: string;
    uri: string;
    name: string;
    image: string;

    albumUri: string | null;
    albumName: string | null;
    artist: string | null;
    artistUri: string | null;
    explicit: boolean;

    // this is used by ActivityFeed to let prisma know from who the track is from (who sent, or liked)
    userId?: string;
  };
  user: Profile | null;
  isSmallScreen?: boolean;
};

const AddQueue = ({
  track: { uri, trackId, image, albumUri, albumName, name, artist, artistUri, explicit, userId },
  user,
  isSmallScreen,
}: AddQueueProps) => {
  const { id: paramId } = useParams();
  const currentUser = useSessionUser();
  const submit = useSubmit();
  const fetcher = useFetcher();
  const { pathname, search } = useLocation();
  const isAdding = fetcher.submission?.formData.get('uri') === uri;

  const isDone = fetcher.type === 'done';
  const isError =
    typeof fetcher.data === 'string'
      ? fetcher.data.includes('Error')
        ? fetcher.data
        : null
      : null;

  const isSending = !!user;
  const id = userId || user?.userId || paramId;

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

    const action = isSending ? `/${id}/add` : `/${currentUser.userId}/add`;

    const fromUserId = isSending ? currentUser?.userId : id;
    const sendToUserId = isSending ? id : currentUser?.userId;

    const data = {
      trackId,
      uri,
      image,
      albumUri: albumUri ?? '',
      albumName: albumName ?? '',
      name,
      artist: artist ?? '',
      artistUri: artistUri ?? '',
      explicit: explicit ? 'true' : '',

      fromId: fromUserId ?? '',
      toId: sendToUserId ?? '',
      action: isSending ? 'send' : 'add',
    };

    fetcher.submit(data, { replace: true, method: 'post', action });
  };

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
      {!isSmallScreen ? (
        <MenuItem
          onClick={addToQueue}
          icon={icon}
          isDisabled={!!isDone || !!isError || !!isAdding}
          // bug: fetcher isn't updating its state to loading
          // so close menu when adding to queue for now
          closeOnSelect={true}
        >
          {isAdding ? <Waver /> : text}
        </MenuItem>
      ) : user ? (
        <Button
          onClick={addToQueue}
          isDisabled={!!isDone || !!isError || !!isAdding}
          variant="drawer"
          fontSize="18px"
          py="30px"
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
      ) : (
        <Button
          onClick={addToQueue}
          leftIcon={icon}
          isDisabled={!!isDone || !!isError || !!isAdding}
          variant="drawer"
          fontSize="14px"
        >
          {isAdding ? <Waver /> : text}
        </Button>
      )}
    </>
  );
};

export default AddQueue;
