import { Button } from '@chakra-ui/react';
import { useFetcher, useLocation, useParams } from '@remix-run/react';
import { CloseSquare, Send2, TickSquare } from 'iconsax-react';

type SendToProps = {
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
};

const SendTo = ({
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
}: SendToProps) => {
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

  const action = userId && sendTo ? `/${id}/add` : '/auth/spotify?returnTo=' + pathname + search;

  return (
    <>
      {!isDone ? (
        <fetcher.Form replace method="post" action={action}>
          <input type="hidden" name="uri" value={uri} />
          <input type="hidden" name="image" value={image} />
          <input type="hidden" name="albumUri" value={albumUri ?? ''} />
          <input type="hidden" name="albumName" value={albumName ?? ''} />
          <input type="hidden" name="name" value={name} />
          {artist && <input type="hidden" name="artist" value={artist} />}
          <input type="hidden" name="artistUri" value={artistUri ?? ''} />
          {/* empty string is falsy */}
          <input type="hidden" name="explicit" value={explicit ? 'true' : ''} />
          {/* sendTo: receiving song (id), sending song (userId) */}
          {/* addTo: receiving song (userId), sending song indirectly (id; aka current opened profile) */}
          <input type="hidden" name="fromId" value={userId} />
          <input type="hidden" name="action" value={'send'} />
          <Button
            type="submit"
            aria-label="queue"
            leftIcon={<Send2 />}
            variant="ghost"
            isLoading={isAdding}
            _hover={{ color: 'spotify.green', boxShadow: 'none' }}
            p="0px 0px"
            w="200px"
            justifyContent="flex-start"
            boxShadow="none"
            _active={{ boxShadow: 'none' }}
          >
            {userId === undefined
              ? 'Log in to send a song'
              : 'Add to ' + (sendTo ? sendTo.split(' ')[0] : '') + ' queue'}
          </Button>
        </fetcher.Form>
      ) : isError ? (
        <Button
          leftIcon={<CloseSquare size="25px" />}
          variant="ghost"
          aria-label="failed to queue"
          justifyContent="flex-start"
          p="0px 0px"
          w="200px"
          boxShadow="none"
          _active={{ boxShadow: 'none' }}
          _hover={{ boxShadow: 'none' }}
        >{`Failed (${fetcher.data.split(' ').slice(1).join(' ')})`}</Button>
      ) : (
        <Button
          leftIcon={<TickSquare size="25px" />}
          variant="ghost"
          aria-label="queued"
          justifyContent="flex-start"
          p="0px 0px"
          w="200px"
          boxShadow="none"
          _active={{ boxShadow: 'none' }}
          _hover={{ boxShadow: 'none' }}
        >
          {typeof fetcher.data === 'string' ? fetcher.data : 'Authenticated'}
        </Button>
      )}
    </>
  );
};

export default SendTo;
