import {
  Form,
  useNavigate,
  useSearchParams,
  useSubmit,
  useTransition,
  useLocation,
} from '@remix-run/react';
import type { ChangeEvent } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';

import {
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';

import { CloseSquare } from 'iconsax-react';

import { useMobileKeyboardActions } from '~/hooks/useMobileKeyboardCheck';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchDefault = searchParams.get('spotify');
  const [search, setSearch] = useState(searchDefault ?? '');
  const ref = useRef<HTMLFormElement>(null);
  const divRef = useRef<HTMLInputElement>(null);
  const submit = useSubmit();
  const transition = useTransition();
  const { pathname } = useLocation();
  const isSearching = pathname.includes('search');
  const busy = transition.submission?.formData.has('spotify') ?? false;
  const navigate = useNavigate();
  const color = useColorModeValue('music.800', 'music.200');
  const { hideMenu, showMenu } = useMobileKeyboardActions();

  useEffect(() => {
    const delaySubmit = setTimeout(() => {
      if (search.trim().length > 0) {
        submit(ref.current);
      }
    }, 1000);

    return () => clearTimeout(delaySubmit);
  }, [search, submit]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim()) {
      setSearch(e.currentTarget.value);
    } else {
      setSearch('');
      searchParams.delete('spotify');
      setSearchParams(searchParams, {
        replace: true,
        state: { scroll: false },
      });
    }
  };
  const handleBlur = () => {
    showMenu();
    if (search === '' && !isSearching) {
      navigate(-1);
      searchParams.delete('spotify');
      setSearchParams(searchParams, {
        replace: true,
        state: { scroll: false },
      });
    }
  };

  const onClearSearch = () => {
    setSearch('');
    searchParams.delete('spotify');
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
    navigate(-1);
  };

  useEffect(() => {
    if (!searchDefault) {
      setSearch('');
    }
  }, [searchDefault]);

  useEffect(() => {
    const handleOpenButtonOutside = (e: MouseEvent) => {
      if (
        divRef.current &&
        !divRef.current.contains(e.target as Node) &&
        search === '' &&
        isSearching
      ) {
        navigate(-1);
      }
    };

    document.addEventListener('click', handleOpenButtonOutside);
    return () => {
      document.removeEventListener('click', handleOpenButtonOutside);
    };
  }, [divRef, search, navigate, isSearching]);

  return (
    <div ref={divRef}>
      <Form ref={ref} method="get" action="search">
        {searchParams.get('top-filter') && (
          <input
            type="hidden"
            name="top-filter"
            value={searchParams.get('top-filter') ?? 'medium-term'}
          />
        )}
        <Flex flex={1} mb={0} align="center">
          <InputGroup>
            <Input
              name="spotify"
              variant="flushed"
              size="sm"
              value={search}
              placeholder="Send a song"
              autoComplete="off"
              borderRadius={0}
              onChange={onChange}
              fontSize="15px"
              onBlur={handleBlur}
              onFocus={hideMenu}
            />
            {search && (
              <InputRightElement
                h="35px"
                w="65px"
                pr={2}
                justifyContent="end"
                children={
                  <>
                    {busy && <Spinner size="xs" mr={2} color={color} />}
                    <IconButton
                      aria-label="close"
                      variant="ghost"
                      size="xs"
                      borderRadius={8}
                      onClick={onClearSearch}
                      icon={<CloseSquare />}
                      color={color}
                    />
                  </>
                }
              />
            )}
          </InputGroup>
        </Flex>
      </Form>
    </div>
  );
};

export default Search;
