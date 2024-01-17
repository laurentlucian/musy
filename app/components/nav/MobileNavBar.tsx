import { Link, useLocation, useNavigation } from '@remix-run/react';

import { Home2, SearchNormal1 } from 'iconsax-react';

import useCurrentUser from '~/hooks/useCurrentUser';
import useIsMobile from '~/hooks/useIsMobile';
import { useMobileKeyboard } from '~/hooks/useMobileKeyboardCheck';
import { cn } from '~/lib/cn';
import Waver from '~/lib/icons/Waver';

import { useFullscreen } from '../fullscreen/Fullscreen';

const MobileNavBar = () => {
  const navigation = useNavigation();
  const currentUser = useCurrentUser();
  const isSmallScreen = useIsMobile();
  const { pathname } = useLocation();
  const { components } = useFullscreen();
  const { show } = useMobileKeyboard();

  if (!isSmallScreen) return null;

  const hideButton = pathname === '/settings' || !show ? true : false;

  const isHomeLoading = navigation.location?.pathname === '/home';
  const isExploreLoading = navigation.location?.pathname === '/explore';
  const isProfileLoading = navigation.location?.pathname === `/${currentUser?.userId}`;

  const isHomeActive = pathname === '/home';
  const isExploreActive = pathname === '/explore';
  const isProfileActive = pathname === `/${currentUser?.userId}`;

  const profileIcon = <img src={currentUser?.image} className='w-8 rounded-full' alt='nav' />;

  return (
    <div
      className={cn('h-20', {
        none: components.length || hideButton,
      })}
    >
      <header className='fixed bottom-0 left-0 right-0 z-10 grid min-h-20 w-full grid-cols-3 bg-musy-900'>
        <div className='flex items-center justify-center'>
          <Link
            className={cn('w-12 py-6 opacity-40', {
              hidden: isHomeLoading,
              'opacity-100': isHomeActive,
            })}
            to='/home'
            prefetch='render'
            aria-label='home'
          >
            <Home2 variant={isHomeActive ? 'Bold' : 'Outline'} />
          </Link>
          {isHomeLoading && <Waver className='absolute inset-0' />}
        </div>

        <div className='flex items-center justify-center'>
          <Link
            className={cn('w-12 py-6 opacity-40', {
              hidden: isExploreLoading,
              'opacity-100': isExploreActive,
            })}
            to='/explore'
            prefetch='render'
            aria-label='search'
          >
            <SearchNormal1 variant={isExploreActive ? 'Bold' : 'Outline'} />
          </Link>
          {isExploreLoading && <Waver className='absolute inset-0' />}
        </div>

        <div className='flex items-center justify-center'>
          <Link
            className={cn('w-12 py-6 opacity-40', {
              hidden: isProfileLoading,
              'opacity-100': isProfileActive,
            })}
            to={`/${currentUser?.userId}`}
            prefetch='render'
            aria-label='profile'
          >
            {profileIcon}
          </Link>
          {isProfileLoading && <Waver className='absolute inset-0' />}
        </div>
      </header>
    </div>
  );
};

export default MobileNavBar;
