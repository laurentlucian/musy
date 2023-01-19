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
    console.log('clicked Queue!');
    if (!sendList && sendMenu.isOpen) {
      sendMenu.onClose();
    } else sendMenu.onOpen();
  }, [sendList, setSendList, sendMenu]);

  const onClickRecommend = useCallback(() => {
    setSendList(true);
    console.log('clicked Recommend!');
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
