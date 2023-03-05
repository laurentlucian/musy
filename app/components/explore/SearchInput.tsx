import { useFetcher, useSearchParams } from '@remix-run/react';
import { type ChangeEvent, type Dispatch, type SetStateAction, useRef } from 'react';

import { SearchIcon } from '@chakra-ui/icons';
import {
  CloseButton,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useColorModeValue,
} from '@chakra-ui/react';

import type { Track } from '@prisma/client';

import useIsMobile from '~/hooks/useIsMobile';
import { useMobileKeyboardActions } from '~/hooks/useMobileKeyboardCheck';

import Waver from '../icons/Waver';
import UserMenu from '../nav/UserMenu';

const SearchInput = ({
  search,
  setSearch,
  setTracks,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  setTracks: Dispatch<SetStateAction<Track[]>>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const color = useColorModeValue('music.800', 'music.200');
  const { hideMenu, showMenu } = useMobileKeyboardActions();
  const inputRef = useRef<HTMLInputElement>(null);
  const isSmallScreen = useIsMobile();
  const { state } = useFetcher();
  const busy = state === 'loading' ?? false;

  const deleteSearch = () => {
    searchParams.delete('spotify');
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim()) {
      setSearch(e.currentTarget.value);
    } else {
      setSearch('');
      deleteSearch();
    }
  };

  const onClose = () => {
    setSearch('');
    setTracks([]);
    const deleteParamDelay = setTimeout(() => {
      deleteSearch();
    }, 600);
    clearTimeout(deleteParamDelay);
  };

  return (
    <HStack justifyContent="space-between" h="100%">
      <InputGroup
        w={['90vw', '500px']}
        mr="27px"
        mt="-5px"
        pos="fixed"
        top={[2]}
        left={[0, '37.5%']}
        bg={bg}
        zIndex={1}
        overflowY="hidden"
      >
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
          ref={inputRef}
          name="spotify"
          value={search}
          placeholder="search"
          autoComplete="off"
          onChange={onChange}
          onBlur={showMenu}
          transition="all 0.5s ease-in-out"
          _placeholder={{ color: '#414040' }}
          focusBorderColor={color}
          onFocus={hideMenu}
        />
        {search && (
          <InputRightElement
            justifyContent="end"
            w="69px"
            children={
              <>
                {busy && <Waver />}
                <IconButton
                  aria-label="close"
                  variant="unstyled"
                  borderRadius={8}
                  onClick={onClose}
                  icon={<CloseButton />}
                />
              </>
            }
          />
        )}
      </InputGroup>
      {isSmallScreen && <UserMenu />}
    </HStack>
  );
};

export default SearchInput;
