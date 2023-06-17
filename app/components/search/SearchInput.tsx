import { useNavigation, useSearchParams } from '@remix-run/react';
import { useRef, useState } from 'react';

import { SearchIcon } from '@chakra-ui/icons';
import type { InputGroupProps } from '@chakra-ui/react';
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

type SearchInputProps = InputGroupProps & {
  param: string;
};

const SearchInput = ({ autoFocus, ...props }: SearchInputProps) => {
  const color = useColorModeValue('musy.800', 'musy.200');

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get(props.param) || '');
  const { hideMenu, showMenu } = useMobileKeyboardActions();
  const navigation = useNavigation();

  const isLoading =
    navigation.state === 'loading' && navigation.location.search.includes(`?${props.param}=`);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const setSearchURL = (search: string) => {
    setSearchParams(
      {
        // allow search input to reused in different screens without triggering others; eg: /explore search and fullscreen search
        // by using the param as the key, we can have multiple search inputs without them conflicting
        search: props.param,
        [props.param]: search,
        // i know this is confusing; plshelp figure out a better way to share component
        // test by using send song fullscreen when on /explore route
        // maybe instead of sharing component we can share functionality and types
      },
      {
        replace: true,
        state: { scroll: false },
      },
    );
  };

  const removeSearchURL = () => {
    searchParams.delete(props.param);
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
  };

  return (
    <InputGroup zIndex={1} overflowY="hidden" {...props}>
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
        name="spotify"
        value={search}
        variant="flushed"
        fontSize="14px"
        placeholder="Search"
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
        autoFocus={autoFocus}
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
