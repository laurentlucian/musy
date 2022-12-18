import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  type PlacementWithLogical,
} from '@chakra-ui/react';
import { useParams } from '@remix-run/react';
import { ElementPlus } from 'iconsax-react';
import AddQueue from './AddQueue';

type ActionMenuConfig = {
  uri: string;
  image: string;
  albumUri: string | null;
  albumName: string | null;
  name: string;
  artist: string | null;
  artistUri: string | null;
  explicit: boolean;
  userId?: string;
  sendTo?: string;
  placement: PlacementWithLogical | undefined;
  offset?: [number, number];
};
const ActionMenu = ({
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
  placement,
  offset,
}: ActionMenuConfig) => {
  const { id } = useParams();

  return (
    <Menu
      direction="ltr"
      placement={placement}
      colorScheme={'menuTheme'}
      closeOnSelect={false}
      offset={offset}
    >
      <MenuButton
        as={IconButton}
        variant="ghost"
        aria-label="options"
        icon={<ElementPlus />}
        boxShadow="none"
        _active={{ boxShadow: 'none', opacity: 1 }}
        _hover={{ boxShadow: 'none', opacity: 1, color: 'spotify.green' }}
        opacity={0.5}
      />
      <MenuList>
        <MenuItem closeOnSelect={false} w="100%" as="span">
          <AddQueue
            key={id}
            uri={uri}
            image={image}
            albumName={albumName}
            albumUri={albumUri}
            name={name}
            artist={artist}
            artistUri={artistUri}
            explicit={explicit ?? false}
            userId={userId}
            sendTo={sendTo}
            isReceiver={false}
          />
        </MenuItem>
        <MenuItem closeOnSelect={false} w="100%" as="span">
          <AddQueue
            key={id}
            uri={uri}
            image={image}
            albumName={albumName}
            albumUri={albumUri}
            name={name}
            artist={artist}
            artistUri={artistUri}
            explicit={explicit ?? false}
            userId={userId}
            isReceiver={true}
          />
        </MenuItem>
        <MenuItem>hi</MenuItem>
      </MenuList>
    </Menu>
  );
};
export default ActionMenu;
