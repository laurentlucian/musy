import { Icon, IconButton, Input, Spinner } from '@chakra-ui/react';
import { useFetcher, useParams } from '@remix-run/react';
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

  const isAdding = fetcher.submission?.formData.get('uri') === uri;
  const isDone = fetcher.type === 'done';
  const isError =
    typeof fetcher.data === 'string'
      ? fetcher.data.includes('Error')
        ? fetcher.data
        : null
      : null;

  return (
    <>
      {!isAdding && !isDone ? (
        <fetcher.Form
          replace
          method="post"
          action={
            sendTo ? `/${id}/add` : userId ? `/${userId}/add` : '/auth/spotify?returnTo=/' + id
          }
        >
          <Input type="hidden" name="uri" value={uri} />
          <Input type="hidden" name="image" value={image} />
          <Input type="hidden" name="albumUri" value={albumUri ?? ''} />
          <Input type="hidden" name="albumName" value={albumName ?? ''} />
          <Input type="hidden" name="name" value={name} />
          <Input type="hidden" name="artist" value={artist} />
          <Input type="hidden" name="artistUri" value={artistUri ?? ''} />
          {/* empty string is falsy */}
          <Input type="hidden" name="explicit" value={explicit ? 'true' : ''} />
          {/* sendTo: receiving song (id), sending song (userId) */}
          {/* addTo: receiving song (userId), sending song indirectly (id; aka current opened profile) */}
          <Input type="hidden" name="fromId" value={sendTo ? userId : id} />
          <Tooltip label={'Add to ' + (sendTo ? sendTo.split(' ')[0] : '') + ' queue'}>
            <IconButton
              type="submit"
              aria-label="queue"
              icon={sendTo ? <Send2 /> : <AddSquare />}
              variant="ghost"
              p={0}
            />
          </Tooltip>
        </fetcher.Form>
      ) : !isDone ? (
        <Spinner />
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
