import { Link, useNavigation } from "@remix-run/react";

import useCurrentUser from "~/hooks/useCurrentUser";
import Waver from "~/lib/icons/Waver";

const Nav = () => {
  const currentUser = useCurrentUser();
  const transition = useNavigation();

  return (
    <header className="sticky top-0 z-10 flex w-full justify-center backdrop-blur-[27px]">
      <div className="flex w-full items-center justify-between py-5 sm:w-[450px] md:w-[750px] xl:w-[1100px]">
        <div className="flex items-center space-x-3">
          <Link className="group flex items-center space-x-2" to="/">
            <img className="w-[28px]" src="/musylogo1.svg" alt="musy-logo" />
            <h1 className="text-md font-semibold group-hover:text-neutral-300">
              musy
            </h1>
          </Link>
          <Link
            to="/explore"
            className="text-sm font-extralight hover:underline"
          >
            explore
          </Link>
          <Link
            to="/analysis"
            className="text-sm font-extralight hover:underline"
          >
            analyze
          </Link>
          {transition.state === "loading" && <Waver />}
        </div>
        <Link to={`/${currentUser?.userId}`}>
          <img
            className="h-[30px] w-[30px] rounded-full md:h-[40px] md:w-[40px]"
            src={currentUser?.image}
            alt="user"
          />
        </Link>
      </div>
    </header>
  );
};

export default Nav;
