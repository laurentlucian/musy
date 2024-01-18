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
      <div className='flex sm:flex-col lg:flex-row h-full sm:justify-start lg:justify-between'>
        <div className='flex sm:flex-row lg:flex-col w-28 h-full'>
          <Link
          className='sm:text-sm lg:text-md w-20'
            to='/settings'
            replace
            aria-current={location.pathname === '/settings' ? 'page' : undefined}
            // _activeLink={{ opacity: 1, textDecor: 'underline' }}
            onClick={handleClick}
          >
            account
          </Link>
          <Link
          className='sm:text-sm lg:text-md w-28'
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
          <div className='h-[1px] w-full self-center bg-[#EEE6E2]'/>
        ) : (
            <div className='h-[86vh] w-[1px] bg-[#EEE6E2]'/>
        )}
        <Outlet />
      </div>
  );
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Settings;
