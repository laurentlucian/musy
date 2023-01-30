import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, InputGroup, InputLeftElement, Icon, Box, useDisclosure } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const UserSearch = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const handleChange = (event) => setValue(event.target.value);
  const handleBlur = () => {
    if (!value) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 'auto' }}
          animate={{ width: 'auto' }}
          exit={{ width: 0 }}
          transition={{ type: 'spring' }}
        >
          <InputGroup size="xs" w="120px">
            <InputLeftElement children={<SearchIcon color="gray.200" />} />
            <Input
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              ref={inputRef}
              rounded="xl"
              type="search"
              placeholder="Search"
            />
          </InputGroup>
        </motion.div>
      )}
      {!isOpen && (
        <Box
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            onOpen();
            setTimeout(() => inputRef.current.focus(), 0);
          }}
        >
          <SearchIcon color="gray.200" />
        </Box>
      )}
    </AnimatePresence>
  );
};

export default UserSearch;
