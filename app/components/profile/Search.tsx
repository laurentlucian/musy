import {
  Form,
  useNavigate,
  useParams,
  useSearchParams,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import type { ChangeEvent } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';

import { Flex, IconButton, Input, InputGroup, InputRightElement, Spinner } from '@chakra-ui/react';

import { CloseSquare } from 'iconsax-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchDefault = searchParams.get('spotify');
  const [search, setSearch] = useState(searchDefault ?? '');
  const ref = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const transition = useTransition();
  const busy = transition.submission?.formData.has('spotify') ?? false;
  const { id } = useParams();
  const navigate = useNavigate();

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

  const onClearSearch = () => {
    setSearch('');
    searchParams.delete('spotify');
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
    navigate(`/${id}`);
  };

  return (
    <>
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
            />
            {search && (
              <InputRightElement
                h="35px"
                w="65px"
                pr={2}
                justifyContent="end"
                children={
                  <>
                    {busy && <Spinner size="xs" mr={2} />}
                    <IconButton
                      aria-label="close"
                      variant="ghost"
                      size="xs"
                      borderRadius={8}
                      onClick={onClearSearch}
                      icon={<CloseSquare />}
                    />
                  </>
                }
              />
            )}
          </InputGroup>
        </Flex>
      </Form>
    </>
  );
};

export default Search;
