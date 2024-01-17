import { useNavigate } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { useSaveState, useSetShowAlert } from '~/hooks/useSaveTheme';

const SettingsHeader = () => {
  const [show, setShow] = useState(0);
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
    window.addEventListener('scroll', checkScroll);

    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  return (
    <div className='h-full w-full'>
      <div className='stack-h-2 w-full justify-center'>
        <h1 className='ml-5 mt-4 text-[13px]'>Settings</h1>
        <button className='fixed right-0 top-1' onClick={handleClick}>
          Done
        </button>
      </div>
      {/* <Divider bg={show + 50 <= 45 ? bg : color} /> */}
    </div>
  );
};

export default SettingsHeader;
