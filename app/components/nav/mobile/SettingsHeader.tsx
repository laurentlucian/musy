import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

import { useSaveState, useSetShowAlert } from "~/hooks/useSaveTheme";

const SettingsHeader = () => {
  const [_show, setShow] = useState(0);
  const navigate = useNavigate();

  const disable = useSaveState();
  const showAlert = useSetShowAlert();

  const handleClick = () => {
    if (disable) {
      showAlert();
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const checkScroll = () => {
      setShow(window.scrollY - 50);
    };
    window.addEventListener("scroll", checkScroll);

    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  return (
    <div className="h-full w-full">
      <div className="stack-h-2 w-full justify-center">
        <h1 className="mt-4 ml-5 text-[13px]">Settings</h1>
        <button className="fixed top-1 right-0" onClick={handleClick}>
          Done
        </button>
      </div>
      {/* <Divider bg={show + 50 <= 45 ? bg : color} /> */}
    </div>
  );
};

export default SettingsHeader;
