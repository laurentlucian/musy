import { useTypedRouteLoaderData } from "remix-typedjson";

import type { loader } from "~/root";

const useIsMobile = () => {
  const data = useTypedRouteLoaderData<typeof loader>("root");

  return Boolean(data?.isMobile);
};

export default useIsMobile;
