import type { MenuProps } from '@chakra-ui/react';
import { IconButton, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { useNavigate } from '@remix-run/react';
import { DocumentText, HambergerMenu } from 'iconsax-react';
import AddQueue from './AddQueue';

type ActionMenuConfig = {
  track: {
    trackId?: string;
    uri: string;
    image: string;
    albumUri: string | null;
    albumName: string | null;
    name: string;
    artist: string | null;
    artistUri: string | null;
    explicit: boolean;
  };
  fromUserId?: string;
  sendTo?: string;
} & Omit<MenuProps, 'children'>;

const ActionMenu = ({
  track: { trackId, uri, image, albumUri, albumName, name, artist, artistUri, explicit },
  fromUserId,
  sendTo,
  ...menuProps
}: ActionMenuConfig) => {
  const navigate = useNavigate();

  return (
    <Menu direction="ltr" {...menuProps}>
      <MenuButton
        as={IconButton}
        variant="ghost"
        aria-label="options"
        icon={<HambergerMenu />}
        boxShadow="none"
        _active={{ boxShadow: 'none', opacity: 1 }}
        _hover={{ boxShadow: 'none', opacity: 1, color: 'spotify.green' }}
        opacity={0.5}
      />
      <MenuList rootProps={{ verticalAlign: 'left' }}>
        <AddQueue
          uri={uri}
          image={image}
          albumName={albumName}
          albumUri={albumUri}
          name={name}
          artist={artist}
          artistUri={artistUri}
          explicit={explicit}
          userId={fromUserId}
          sendTo={sendTo}
          isReceiver={false}
        />
        <AddQueue
          uri={uri}
          image={image}
          albumName={albumName}
          albumUri={albumUri}
          name={name}
          artist={artist}
          artistUri={artistUri}
          explicit={explicit}
          userId={fromUserId}
          isReceiver={true}
        />
        {trackId && (
          <MenuItem icon={<DocumentText />} onClick={() => navigate(`/analysis/${trackId}`)}>
            Analyze track
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};
export default ActionMenu;
