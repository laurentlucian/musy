import { useNavigation, useSearchParams } from '@remix-run/react';
import { useRef, useState } from 'react';

import { SearchIcon } from '@chakra-ui/icons';
import {
  CloseButton,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useColorModeValue,
} from '@chakra-ui/react';

import { useMobileKeyboardActions } from '~/hooks/useMobileKeyboardCheck';
import Waver from '~/lib/icons/Waver';

const SearchInput = () => {
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const color = useColorModeValue('musy.800', 'musy.200');

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('keyword') || '');
  const { hideMenu, showMenu } = useMobileKeyboardActions();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigation = useNavigation();

  const isLoading =
    navigation.state === 'loading' && navigation.location.search.includes('?search=');

  const timeoutRef = useRef<NodeJS.Timeout>();
  const setSearchURL = (search: string) => {
    setSearchParams(
      { search: search },
      {
        replace: true,
        state: { scroll: false },
      },
    );
  };

  const removeSearchURL = () => {
    searchParams.delete('search');
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
  };

  return (
    <InputGroup w={['70vw', '500px']} bg={bg} zIndex={1} overflowY="hidden">
      <InputLeftElement
        pointerEvents="all"
        children={
          <IconButton
            aria-label="search"
            icon={<SearchIcon boxSize="16px" />}
            variant="unstyled"
            color={color}
            cursor="pointer"
          />
        }
      />
      <Input
        pt={1}
        ref={inputRef}
        name="spotify"
        value={search}
        variant="flushed"
        fontSize="14px"
        placeholder="search"
        autoComplete="off"
        onChange={(e) => {
          const search = e.currentTarget.value;
          setSearch(search);
          if (search.trim().length) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              setSearchURL(search);
            }, 100);
          } else {
            removeSearchURL();
          }
        }}
        transition="all 0.3s ease-in-out"
        _placeholder={{ color: '#414040' }}
        focusBorderColor={color}
        onFocus={hideMenu}
        onBlur={showMenu}
      />
      {search && (
        <InputRightElement
          justifyContent="end"
          w="69px"
          children={
            <>
              {isLoading && <Waver />}
              <IconButton
                as="span"
                aria-label="close"
                variant="unstyled"
                borderRadius={8}
                onClick={() => {
                  setSearch('');
                  removeSearchURL();
                }}
                icon={<CloseButton />}
                mr={1}
              />
            </>
          }
        />
      )}
    </InputGroup>
  );
};

export default SearchInput;
