import { useLocation } from '@remix-run/react';

import useCurrentUser from '~/hooks/useCurrentUser';
import { cn } from '~/lib/cn';

// import ProfileActions from '../profile/profileHeader/profileActions/ProfileActions';
import SearchInput from '../search/SearchInput';
import ProfileHeader from './mobile/ProfileHeader';
import SettingsHeader from './mobile/SettingsHeader';

const MobileHeader = () => {
  const currentUser = useCurrentUser();
  const { pathname } = useLocation();

  const isHome = pathname === '/home';
  const isExplore = pathname === '/explore';
  const isSettings = pathname === '/settings';
  const isProfile = !isHome && !isExplore && !isSettings;
  const isOwnProfile = currentUser?.userId === pathname.split('/')[1];

  const Header = isHome ? (
    <img src='/musylogo1.svg' className='-mb-2 w-[35px]' alt='musy-logo' />
  ) : isExplore ? (
    <SearchInput param='keyword' />
  ) : isSettings ? (
    <SettingsHeader />
  ) : (
    <ProfileHeader />
  );

  return (
    <header
      className={cn(
        'z-10 flex h-[45px] w-full items-center justify-center bg-transparent py-[8px] backdrop-blur-[27px]',
        {
          'border-primary-400 border-b': isProfile,
        },
      )}
      // bg={isProfile ? 'transparent' : bg}
    >
      {Header}
      {/* {isProfile ? isOwnProfile ? <UserMenu /> : <ProfileActions /> : null} */}
    </header>
  );
};

export default MobileHeader;
