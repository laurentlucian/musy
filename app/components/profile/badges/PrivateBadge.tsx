import { LockCircle } from 'iconsax-react';
import { useTypedRouteLoaderData } from 'remix-typedjson';

import Tooltip from '~/components/Tooltip';
import useSessionUser from '~/hooks/useSessionUser';
import type { loader } from '~/routes/$id';

const PrivateBadge = () => {
  const data = useTypedRouteLoaderData<typeof loader>('routes/$id');
  const currentUser = useSessionUser();

  if (!data) return null;

  const isOwnProfile = currentUser?.userId === data.user.userId;
  const isPrivate = data.user.settings?.isPrivate && !isOwnProfile;

  if (!isPrivate) return null;

  return (
    <Tooltip label="Private" placement="top" hasArrow>
      <LockCircle size="32" variant="Bulk" />
    </Tooltip>
  );
};

export default PrivateBadge;
