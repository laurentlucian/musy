import { MenuItem } from '@chakra-ui/react';
import { useFetcher, useLocation, useParams } from '@remix-run/react';
import { AddSquare, CloseSquare, Send2, TickSquare } from 'iconsax-react';
import useParamUser from '~/hooks/useParamUser';
import useSessionUser from '~/hooks/useSessionUser';
import Waver from '../Waver';

type AddQueueProps = {
  track: {
    uri: string;
    name: string;
    image: string;

    albumUri: string | null;
    albumName: string | null;
    artist: string | null;
    artistUri: string | null;
    explicit: boolean;
  };

  // @param userId: user's spotify id
  sendTo?: string;
};

const AddQueue = ({
  track: { uri, image, albumUri, albumName, name, artist, artistUri, explicit },
  sendTo,
}: AddQueueProps) => {
  const { id } = useParams();
  const user = useParamUser();
  const currentUser = useSessionUser();

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

  const isSending = !!sendTo;

  const addToQueue = () => {
    const action = currentUser
      ? isSending
        ? `/${id}/add`
        : `/${currentUser.userId}/add`
      : // @todo figure out a better way to require authentication on click;
        // after authentication redirect, add to queue isn't successful. user needs to click again
        '/auth/spotify?returnTo=' + pathname + search;

    const form = new FormData();
    const fromUserId = isSending ? currentUser?.userId : id;
    const sendToUserId = isSending ? sendTo : currentUser?.userId;

    const data = {
      uri,
      image,
      albumUri: albumUri ?? '',
      albumName: albumName ?? '',
      name,
      artist: artist ?? '',
      artistUri: artistUri ?? '',
      explicit: explicit ? 'true' : '',

      // sendTo: receiving song (id), sending song (userId)
      // addTo: receiving song (userId), sending song indirectly (id; aka current opened profile)
      fromId: fromUserId ?? '',
      toId: sendToUserId ?? '',
      action: isSending ? 'send' : 'add',
    };

    for (const key in data) {
      form.append(key, data[key as keyof typeof data]);
    }

    fetcher.submit(form, { replace: true, method: 'post', action });
  };

  const icon = isDone ? (
    <TickSquare size="25px" />
  ) : isError ? (
    <CloseSquare size="25px" />
  ) : isSending ? (
    <Send2 />
  ) : (
    <AddSquare />
  );

  const qText = 'Send to ' + (isSending ? user?.name.split(' ')[0] : 'yourself');

  const text = isDone ? (typeof fetcher.data === 'string' ? fetcher.data : 'Authenticated') : qText;

  return (
    <MenuItem
      onClick={addToQueue}
      icon={icon}
      isDisabled={!!isDone || !!isError || !!isAdding}
      closeOnSelect={false}
    >
      {isAdding ? <Waver /> : text}
    </MenuItem>
  );
};

export default AddQueue;
