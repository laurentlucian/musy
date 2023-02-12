import React, { useState, useRef } from 'react';

import { SearchIcon } from '@chakra-ui/icons';
import { Input, InputGroup, InputLeftElement, Box, useDisclosure } from '@chakra-ui/react';

import { motion, AnimatePresence } from 'framer-motion';

const UserSearch = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value);
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
              onChange={(event) => handleChange(event)}
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
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }, 0);
          }}
        >
          <SearchIcon color="gray.200" boxSize="18px" alignSelf="center" />
        </Box>
      )}
    </AnimatePresence>
  );
};

export default UserSearch;
