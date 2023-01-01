import { IconButton } from '@chakra-ui/react';
import { Setting2 } from 'iconsax-react';
import { motion } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import UserSearch from './UserSearch';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <>
      <UserSearch />
      <IconButton
        as={motion.div}
        aria-label="settings"
        icon={<Setting2 />}
        variant="ghost"
        onClick={() => navigate(`/settings`)}
        _active={{ boxShadow: 'none' }}
        _hover={{ boxShadow: 'none', opacity: 1, transform: 'rotate(180deg)' }}
        opacity="0.5"
        transition="opacity 2s ease in out"
        cursor="pointer"
      />
    </>
  );
};
export default Settings;
