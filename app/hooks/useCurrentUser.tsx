import { useTypedRouteLoaderData } from "remix-typedjson";

import type { loader } from "~/root";

const useCurrentUser = () => {
  const currentUser =
    useTypedRouteLoaderData<typeof loader>("root")?.currentUser;

  return currentUser;
};

export const useRequiredCurrentUser = () => {
  const currentUser = useCurrentUser();

  if (!currentUser) throw new Error("No current user");

  return currentUser;
};

export const useCurrentUserId = () => {
  return useCurrentUser()?.userId;
};

export default useCurrentUser;
