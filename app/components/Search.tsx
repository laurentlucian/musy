import { Flex, IconButton, Input, InputGroup, InputRightElement, Spinner } from '@chakra-ui/react';
import { Form, Outlet, useSearchParams, useSubmit, useTransition } from '@remix-run/react';
import { CloseSquare } from 'iconsax-react';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchDefault = searchParams.get('spotify');
  const [search, setSearch] = useState(searchDefault ?? '');
  const ref = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const transition = useTransition();
  const busy = transition.submission?.formData.has('spotify') ?? false;

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

  return (
    <>
      <Form ref={ref} method="get" action="search">
        <Flex flex={1} align="center">
          <InputGroup>
            <Input
              name="spotify"
              variant="flushed"
              size="sm"
              value={search}
              placeholder="Send a song"
              autoComplete="off"
              borderRadius={3}
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
                      onClick={() => {
                        setSearch('');
                        searchParams.delete('spotify');
                        setSearchParams(searchParams, {
                          replace: true,
                          state: { scroll: false },
                        });
                      }}
                      icon={<CloseSquare />}
                    />
                  </>
                }
              />
            )}
          </InputGroup>
        </Flex>
      </Form>
      {search && <Outlet />}
    </>
  );
};

export default Search;
