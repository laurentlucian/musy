import { useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import useCurrentUser from "~/hooks/useCurrentUser";
import useIsMobile from "~/hooks/useIsMobile";
import MobileHeader from "./nav/MobileHeader";
import MobileNavBar from "./nav/MobileNavBar";
import Nav from "./nav/Nav";

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const currentUser = useCurrentUser();
  const isSmallScreen = useIsMobile();

  return (
    <main className="scroll-local flex max-h-content justify-center">
      <section className="stack-3 max-h-content w-full items-center">
        {currentUser ? isSmallScreen ? <MobileHeader /> : <Nav /> : null}
        <motion.div
          className="w-full py-2.5 sm:w-[450px] md:w-[750px] xl:w-[1100px]"
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
        {currentUser && <MobileNavBar />}
      </section>
    </main>
  );
};

export default Layout;
