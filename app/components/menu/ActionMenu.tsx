import type { ChakraProps, MenuProps } from '@chakra-ui/react';
import { IconButton, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { useNavigate, useParams } from '@remix-run/react';
import { DocumentText, More } from 'iconsax-react';
import useSessionUser from '~/hooks/useSessionUser';
import AddQueue from './AddQueue';
import SaveToLiked from './SaveToLiked';

type ActionMenuConfig = {
  track: {
    trackId: string;
    uri: string;
    image: string;
    albumUri: string | null;
    albumName: string | null;
    name: string;
    artist: string | null;
    artistUri: string | null;
    explicit: boolean;
  };
} & Omit<MenuProps, 'children'> &
  ChakraProps;

const ActionMenu = ({
  track: { trackId, uri, image, albumUri, albumName, name, artist, artistUri, explicit },
  ...menuProps
}: ActionMenuConfig) => {
  const { id } = useParams();
  const currentUser = useSessionUser();
  const navigate = useNavigate();
  const isOwnProfile = currentUser?.userId === id;

  return (
    <Menu direction="ltr" {...menuProps} isLazy>
      <MenuButton
        as={IconButton}
        variant="ghost"
        aria-label="options"
        icon={<More />}
        boxShadow="none"
        _active={{ boxShadow: 'none', opacity: 1 }}
        _hover={{ boxShadow: 'none', opacity: 1, color: 'spotify.green' }}
        opacity={0.5}
      />
      <MenuList rootProps={{ verticalAlign: 'left' }}>
        {!isOwnProfile && id && (
          <AddQueue
            track={{
              trackId,
              uri,
              image,
              albumUri,
              albumName,
              name,
              artist,
              artistUri,
              explicit,
            }}
            sendTo={id}
          />
        )}
        <AddQueue
          track={{
            trackId,
            uri,
            image,
            albumUri,
            albumName,
            name,
            artist,
            artistUri,
            explicit,
          }}
        />
        <MenuItem icon={<DocumentText />} onClick={() => navigate(`/analysis/${trackId}`)}>
          Analyze track
        </MenuItem>
        <SaveToLiked trackId={trackId} />
      </MenuList>
    </Menu>
  );
};
export default ActionMenu;
