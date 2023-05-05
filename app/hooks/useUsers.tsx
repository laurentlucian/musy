import { useTypedRouteLoaderData } from 'remix-typedjson';

import type { loader } from '~/root';

const useUsers = () => useTypedRouteLoaderData<typeof loader>('root')?.users ?? [];

export default useUsers;
