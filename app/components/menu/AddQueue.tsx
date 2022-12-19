import { MenuItem } from '@chakra-ui/react';
import { useFetcher, useLocation, useParams } from '@remix-run/react';
import { AddSquare, CloseSquare, Send2, TickSquare } from 'iconsax-react';
import Waver from '../Waver';

type AddQueueProps = {
  uri: string;
  image: string;
  albumUri: string | null;
  albumName: string | null;
  name: string;
  artist: string | null;
  artistUri: string | null;
  explicit: boolean;

  // @todo figure out a better way to require authentication on click;
  // after authentication redirect, add to queue isn't successful. user needs to click again
  userId?: string;
  // user.name
  sendTo?: string;
  isReceiver: boolean;
};

const AddQueue = ({
  uri,
  image,
  albumUri,
  albumName,
  name,
  artist,
  artistUri,
  explicit,
  userId,
  sendTo,
  isReceiver,
}: AddQueueProps) => {
  const { id } = useParams();
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

  const isReceiving = sendTo && !isReceiver;

  const addToQueue = () => {
    const action = userId
      ? isReceiving
        ? `/${id}/add`
        : `/${userId}/add`
      : '/auth/spotify?returnTo=' + pathname + search;

    const form = new FormData();
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
      fromId: (isReceiving ? userId : id) ?? '',
      toId: (isReceiving ? sendTo : userId) ?? '',
      action: isReceiving ? 'send' : 'add',
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
  ) : isReceiving ? (
    <Send2 />
  ) : (
    <AddSquare />
  );

  const qText =
    userId === undefined
      ? 'Log in to ' + (isReceiving ? 'send a song' : 'add to queue')
      : 'Send to ' + (isReceiving ? sendTo.split(' ')[0] : 'yourself');

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
