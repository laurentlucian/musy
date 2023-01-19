import { useDisclosure } from '@chakra-ui/react';
import { useState, useCallback } from 'react';

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
    sendList,
    sendMenu,
    toggle,
    setSendList,
    onClickQueue,
    onClickRecommend,
  };
};
export default useSendMenu;
