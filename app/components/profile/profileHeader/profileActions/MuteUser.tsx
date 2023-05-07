import { useSubmit } from '@remix-run/react';
import { useState } from 'react';

import { MenuItem } from '@chakra-ui/react';

import { VolumeMute } from 'iconsax-react';

type MuteTypes = {
  bg: string;
  color: string;
  mute: boolean;
  muteId: string;
};

const MuteUser = ({ bg, color, mute, muteId }: MuteTypes) => {
  const [isMuted, setIsMuted] = useState(mute);
  const submit = useSubmit();

  const handleClick = () => {
    setIsMuted(!isMuted);
    submit({ muteId: muteId, muteUser: String(!isMuted) }, { method: 'post', replace: true });
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
