import { LockCircle } from "iconsax-react";
import { useTypedRouteLoaderData } from "remix-typedjson";

import useCurrentUser from "~/hooks/useCurrentUser";
import type { loader } from "~/routes/$id";

const PrivateBadge = () => {
  const data = useTypedRouteLoaderData<typeof loader>("routes/$id");
  const currentUser = useCurrentUser();

  if (!data) return null;

  const isOwnProfile = currentUser?.userId === data.user.userId;
  const isPrivate = data.user.settings?.isPrivate && !isOwnProfile;

  if (!isPrivate) return null;

  return <LockCircle size="32" variant="Bulk" />;
};

export default PrivateBadge;
