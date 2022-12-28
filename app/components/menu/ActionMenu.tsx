import { type ChakraProps, type MenuProps } from '@chakra-ui/react';
import { Portal } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { IconButton, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { useNavigate, useParams } from '@remix-run/react';
import { ArrowLeft2, ArrowRight2, DocumentText, More, Send2 } from 'iconsax-react';
import { useState } from 'react';
import useIsMobile from '~/hooks/useIsMobile';
import useParamUser from '~/hooks/useParamUser';
import useSessionUser from '~/hooks/useSessionUser';
import useUsers from '~/hooks/useUsers';
import AddQueue from './AddQueue';
import MobileMenu from './MobileMenu';
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

    // this is used by ActivityFeed to let prisma know from who the track is from (who sent, or liked)
    userId?: string;
  };
} & Omit<MenuProps, 'children'> &
  ChakraProps;

const ActionMenu = ({
  track: { trackId, uri, image, albumUri, albumName, name, artist, artistUri, explicit, userId },
  ...menuProps
}: ActionMenuConfig) => {
  const allUsers = useUsers();
  const [isSending, setIsSending] = useState(false);

  const { id } = useParams();
  const user = useParamUser();
  const currentUser = useSessionUser();
  const navigate = useNavigate();
  const isOwnProfile = currentUser?.userId === id;
  const users = allUsers.filter((user) => user.userId !== currentUser?.userId);
  const isSmallScreen = useIsMobile();

  const SendTo = () => (
    <MenuItem
      icon={<Send2 />}
      onClick={() => setIsSending(true)}
      closeOnSelect={false}
      pos="relative"
    >
      Send to:
      <Icon as={ArrowRight2} boxSize="25px" ml="auto !important" pos="absolute" right="10px" />
    </MenuItem>
  );

  const SendToList = () => (
    <>
      <MenuItem icon={<ArrowLeft2 />} onClick={() => setIsSending(false)} closeOnSelect={false}>
        Send to:
      </MenuItem>
      <AddQueue
        track={{
          trackId,
          userId,
        }}
        user={null}
      />
      {!isOwnProfile && id && (
        <AddQueue
          track={{
            trackId,
          }}
          user={user}
        />
      )}
      {users.map((user) => (
        <AddQueue
          key={user.userId}
          track={{
            trackId,
          }}
          user={user}
        />
      ))}
    </>
  );

  return (
    <>
      {!isSmallScreen ? (
        <Menu direction="ltr" isLazy {...menuProps}>
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
          <Portal>
            <MenuList overflowY="auto" overflowX="hidden" maxH="400px">
              {isSending ? <SendToList /> : <SendTo />}
              {!isSending && (
                <>
                  <MenuItem
                    icon={<DocumentText />}
                    onClick={() => navigate(`/analysis/${trackId}`)}
                  >
                    Analyze
                  </MenuItem>
                  <SaveToLiked trackId={trackId} />
                </>
              )}
            </MenuList>
          </Portal>
        </Menu>
      ) : (
        <MobileMenu
          isOwnProfile={isOwnProfile}
          user={user}
          users={users}
          id={id}
          track={{
            trackId,
          }}
        />
      )}
    </>
  );
};
export default ActionMenu;
