import { useState } from 'react';

import { MenuItem } from '@chakra-ui/react';

import { VolumeMute } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import { useProfileId } from '~/hooks/usePofile';
import { useSessionUserId } from '~/hooks/useSessionUser';
import type { action as muteAction } from '~/routes/api/user/mute';

type Mute = {
  bg: string;
  color: string;
  mute: boolean;
  muteId: string;
};

const MuteUser = ({ bg, color, mute, muteId }: Mute) => {
  const [isMuted, setIsMuted] = useState(mute);
  const fetcher = useTypedFetcher<typeof muteAction>();
  const userId = useProfileId();
  const currentUserId = useSessionUserId();

  const handleClick = () => {
    if (currentUserId) {
      setIsMuted(!isMuted);
      fetcher.submit(
        { currentUserId, isNotMuted: String(!isMuted), muteId, userId },
        { action: '/api/user/mute', method: 'post', replace: true },
      );
    }
  };

  return (
    <MenuItem
      icon={<VolumeMute size="18px" />}
      bg={bg}
      color={color}
      _hover={isMuted ? { color: 'yellow.300' } : { color: 'red' }}
      onClick={handleClick}
    >
      {isMuted ? 'unmute' : 'mute'}
    </MenuItem>
  );
};

export default MuteUser;
