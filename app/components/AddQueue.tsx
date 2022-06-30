import { Icon, IconButton, Input, Spinner } from '@chakra-ui/react';
import { useFetcher, useParams } from '@remix-run/react';
import { AddSquare, CloseSquare, Send2, TickSquare } from 'iconsax-react';
import Tooltip from './Tooltip';

type AddQueueProps = {
  uri: string;
  image: string;
  name: string;
  artist: string;
  explicit: boolean;

  // @todo figure out a better way to require authentication on click;
  // after authentication redirect, add to queue isn't successful. user needs to click again
  userId?: string;
  // user.name
  sendTo?: string;
};

const AddQueue = ({ uri, image, name, artist, explicit, userId, sendTo }: AddQueueProps) => {
  const { id } = useParams();
  const fetcher = useFetcher();

  const isAdding = fetcher.submission?.formData.get('uri') === uri;
  const isDone = fetcher.type === 'done';
  const isError = fetcher.data?.includes('Error') ? true : false;

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
          <Input type="hidden" name="name" value={name} />
          <Input type="hidden" name="artist" value={artist} />
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
        <Spinner ml="auto" />
      ) : isError ? (
        <Tooltip label={`Failed (${fetcher.data.split(' ').slice(1).join(' ')})`} defaultIsOpen>
          <Icon ml="auto" textAlign="right" boxSize="25px" as={CloseSquare} />
        </Tooltip>
      ) : (
        <Tooltip label={fetcher.data} defaultIsOpen>
          <Icon ml="auto" textAlign="right" boxSize="25px" as={TickSquare} />
        </Tooltip>
      )}
    </>
  );
};

export default AddQueue;
