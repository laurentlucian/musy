import { isRouteErrorResponse, useRouteError } from '@remix-run/react';

import Forbidden from './Forbidden';
import NotFound from './NotFound';

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return <NotFound />;
    if (error.status === 403) return <Forbidden />;
  } else if (error instanceof Error) {
    return (
      <>
        <div className='stack-h-2'>
          <h1 className='text-base md:text-base'>500 - </h1>
          <p>oops something broke</p>
        </div>
        <p className='text-sm'>Trace(for debug): {error.message}</p>
      </>
    );
  }

  return (
    <div className='stack-1'>
      <h1 className='text-base md:text-base'>500 - </h1>
      <p>ooooooooooops unknown error</p>
    </div>
  );
};
