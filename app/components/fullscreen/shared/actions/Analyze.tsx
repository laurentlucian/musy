import { useNavigate, useNavigation } from "@remix-run/react";

import { DocumentText } from "iconsax-react";

import Waver from "~/lib/icons/Waver";

import ActionButton from "../FullscreenActionButton";

const Analyze = ({ trackId }: { trackId: string }) => {
  const navigate = useNavigate();
  const transition = useNavigation();
  const isLoading = transition.location?.pathname.includes("analysis");

  return (
    <ActionButton
      leftIcon={<DocumentText />}
      onClick={() => navigate(`/analysis/${trackId}`)}
    >
      {isLoading ? <Waver /> : "View analysis"}
    </ActionButton>
  );
};

export default Analyze;
