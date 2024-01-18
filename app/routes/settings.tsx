import { Link, Outlet, useLocation } from '@remix-run/react';
import type { MouseEvent } from 'react';

import useIsMobile from '~/hooks/useIsMobile';
import { useSaveState, useSetShowAlert } from '~/hooks/useSaveTheme';

const Settings = () => {
  const isSmallScreen = useIsMobile();
  const location = useLocation();
  const disable = useSaveState();
  const showAlert = useSetShowAlert();
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (disable) {
      e.preventDefault();
      showAlert();
    }
  };
  return (
    <div className='flex h-full sm:flex-col sm:justify-start lg:flex-row lg:justify-between'>
      <div className='flex h-full w-28 sm:flex-row lg:flex-col'>
        <Link
          className='lg:text-md w-20 sm:text-sm'
          to='/settings'
          replace
          aria-current={location.pathname === '/settings' ? 'page' : undefined}
          // _activeLink={{ opacity: 1, textDecor: 'underline' }}
          onClick={handleClick}
        >
          account
        </Link>
        <Link
          className='lg:text-md w-28 sm:text-sm'
          to='/settings/appearance'
          replace
          aria-current={location.pathname === '/settings/appearance' ? 'page' : undefined}
          // _activeLink={{ opacity: 1, textDecor: 'underline' }}
          onClick={handleClick}
        >
          appearance
        </Link>
      </div>
      {isSmallScreen ? (
        <div className='h-[1px] w-full self-center bg-[#EEE6E2]' />
      ) : (
        <div className='h-[86vh] w-[1px] bg-[#EEE6E2]' />
      )}
      <Outlet />
    </div>
  );
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Settings;
