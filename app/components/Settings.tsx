import type { Dispatch, SetStateAction } from 'react';
import { useNavigate } from '@remix-run/react';
import { IconButton } from '@chakra-ui/react';
import { Setting2 } from 'iconsax-react';
import { motion } from 'framer-motion';
import useSessionUser from '~/hooks/useSessionUser';

type SettingsConfig = {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
};

const Settings = ({ show, setShow }: SettingsConfig) => {
  const navigate = useNavigate();
  const currentUser = useSessionUser();

  const onClick = () => {
    if (show) {
      navigate(`/settings`);
      setShow(false);
    } else {
      navigate(`/${currentUser?.userId}`);
      setShow(true);
    }
  };

  return (
    <IconButton
      as={motion.div}
      aria-label="settings"
      icon={<Setting2 />}
      variant="ghost"
      onClick={onClick}
      _active={{ boxShadow: 'none' }}
      _hover={{ boxShadow: 'none', opacity: 1, transform: 'rotate(180deg)' }}
      opacity="0.5"
      transition="opacity 2s ease in out"
      cursor="pointer"
    />
  );
};
export default Settings;
