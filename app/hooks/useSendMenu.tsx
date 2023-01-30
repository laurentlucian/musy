import { useState, useCallback } from 'react';

import { useDisclosure } from '@chakra-ui/react';

const useSendMenu = () => {
  const [sendList, setSendList] = useState(false);
  const sendMenu = useDisclosure();

  const toggle = () => {
    setSendList(!sendList);
  };

  const onClickQueue = useCallback(() => {
    setSendList(false);
    if (!sendList && sendMenu.isOpen) {
      sendMenu.onClose();
    } else sendMenu.onOpen();
  }, [sendList, setSendList, sendMenu]);

  const onClickRecommend = useCallback(() => {
    setSendList(true);
    if (sendList && sendMenu.isOpen) {
      sendMenu.onClose();
    } else sendMenu.onOpen();
  }, [sendList, setSendList, sendMenu]);
  return {
    onClickQueue,
    onClickRecommend,
    sendList,
    sendMenu,
    setSendList,
    toggle,
  };
};
export default useSendMenu;
