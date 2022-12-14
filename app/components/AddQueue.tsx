import { Icon, IconButton } from '@chakra-ui/react';
import { useFetcher, useLocation, useParams } from '@remix-run/react';
import { AddSquare, CloseSquare, Send2, TickSquare } from 'iconsax-react';
import Tooltip from './Tooltip';

type AddQueueProps = {
  uri: string;
  image: string;
  albumUri: string | null;
  albumName: string | null;
  name: string;
  artist: string;
  artistUri: string | null;
  explicit: boolean;

  // @todo figure out a better way to require authentication on click;
  // after authentication redirect, add to queue isn't successful. user needs to click again
  userId?: string;
  // user.name
  sendTo?: string;
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

  const action = userId
    ? sendTo
      ? `/${id}/add`
      : `/${userId}/add`
    : '/auth/spotify?returnTo=' + pathname + search;

  return (
    <>
      {!isDone ? (
        <fetcher.Form replace method="post" action={action}>
          <input type="hidden" name="uri" value={uri} />
          <input type="hidden" name="image" value={image} />
          <input type="hidden" name="albumUri" value={albumUri ?? ''} />
          <input type="hidden" name="albumName" value={albumName ?? ''} />
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="artist" value={artist} />
          <input type="hidden" name="artistUri" value={artistUri ?? ''} />
          {/* empty string is falsy */}
          <input type="hidden" name="explicit" value={explicit ? 'true' : ''} />
          {/* sendTo: receiving song (id), sending song (userId) */}
          {/* addTo: receiving song (userId), sending song indirectly (id; aka current opened profile) */}
          <input type="hidden" name="fromId" value={sendTo ? userId : id} />
          <input type="hidden" name="action" value={sendTo ? 'send' : 'add'} />
          <Tooltip
            label={
              userId === undefined
                ? 'Log in to ' + (sendTo ? 'send a song' : 'add to queue')
                : 'Add to ' + (sendTo ? sendTo.split(' ')[0] : '') + ' queue'
            }
          >
            <IconButton
              type="submit"
              aria-label="queue"
              icon={sendTo ? <Send2 /> : <AddSquare />}
              variant="ghost"
              isLoading={isAdding}
              p={0}
            />
          </Tooltip>
        </fetcher.Form>
      ) : isError ? (
        <Tooltip label={`Failed (${fetcher.data.split(' ').slice(1).join(' ')})`} defaultIsOpen>
          <Icon textAlign="right" boxSize="25px" as={CloseSquare} />
        </Tooltip>
      ) : (
        <Tooltip
          label={typeof fetcher.data === 'string' ? fetcher.data : 'Authenticated'}
          defaultIsOpen
        >
          <Icon textAlign="right" boxSize="25px" as={TickSquare} />
        </Tooltip>
      )}
    </>
  );
};

export default AddQueue;
