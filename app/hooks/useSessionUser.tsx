import { useTypedRouteLoaderData } from 'remix-typedjson';

import type { loader } from '~/root';

const useSessionUser = () => useTypedRouteLoaderData<typeof loader>('root')?.currentUser;

export default useSessionUser;
