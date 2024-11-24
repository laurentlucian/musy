import { useParams } from "@remix-run/react";

import { motion } from "framer-motion";
import { Forbidden } from "iconsax-react";

import useCurrentUser from "~/hooks/useCurrentUser";

const block = (
  <motion.div
    animate={{ opacity: [0, 1, 0, 1] }}
    transition={{ duration: 5, loop: Number.POSITIVE_INFINITY }}
  >
    <Forbidden size="30" color="red" />
  </motion.div>
);

const BlockedProfile = ({ name }: { name: string }) => {
  const currentUser = useCurrentUser();
  const { id } = useParams();
  const blockRecord = currentUser?.block.find(
    (blocked) => blocked.blockedId === id,
  );
  const amIBlocked = blockRecord?.blockedId === currentUser?.userId;

  return (
    <div className="space-y-5 px-5">
      <div className="flex">
        {block}
        <p className="opacity-50">
          {amIBlocked
            ? `You have been blocked by ${name}`
            : `You have blocked ${name}`}
        </p>
      </div>
      <button
        type="button"
        className="w-72 text-md md:w-300px"
        onClick={() => window.history.back()}
      >
        go back
      </button>
    </div>
  );
};

export default BlockedProfile;
