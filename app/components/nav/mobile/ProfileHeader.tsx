import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { useEffect } from "react";

import { ArrowLeft2 } from "iconsax-react";
import { useTypedRouteLoaderData } from "remix-typedjson";

import useCurrentUser from "~/hooks/useCurrentUser";
import type { loader } from "~/routes/$id";

const ProfileHeader = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // const [show, setShow] = useState(0);
  const { pathname } = useLocation();
  const { id } = useParams();
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const data = useTypedRouteLoaderData<typeof loader>("routes/$id");
  // const { profileBg } = useThemeBg();

  useEffect(() => {
    // const checkScroll = () => {
    //   setShow(window.scrollY - 50);
    // };
    // window.addEventListener('scroll', checkScroll);
    // return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  if (!data) return null;

  /* <HStack
        h="41px"
        bg={profileBg}
        opacity={show / 90}
        overflow="clip"
        textAlign="center"
      >
        <Stack w="100vw">
          {show <= 84 ? <Box h={show <= 84 ? `${104 - show}px` : '16px'} /> : <Box h="16px" />}
          <Text h="37px" alignSelf="center" opacity={show / 90} w="100vw">
            {user?.name}
          </Text>
        </Stack>
      </HStack> */

  if (currentUser?.userId === id) return null;

  return (
    <button
      className="w-full"
      aria-label="back"
      onClick={() => {
        searchParams.delete("spotify");
        setSearchParams(searchParams, {
          replace: true,
          state: { scroll: false },
        });
        if (!pathname.includes("spotify")) {
          navigate(-1);
        }
      }}
    >
      <ArrowLeft2 />
    </button>
  );
};

export default ProfileHeader;
