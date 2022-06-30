import {
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';
import { Form, useSubmit, useTransition } from '@remix-run/react';
import { CloseSquare, MusicSquareSearch } from 'iconsax-react';
import { useSearchParams } from 'react-router-dom';

type SearchProps = {
  search: string;
  setSearch: (T: string) => void;
};

const Search = ({ search, setSearch }: SearchProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const transition = useTransition();
  const busy = transition.submission?.formData.has('spotify') ?? false;

  return (
    <>
      <Form method="get" action="search">
        <Flex flex={1} align="center">
          {/* {!isSearching && (
            <>
              <Heading fontSize={['md', 'lg']} mr={2}>
                Queue
              </Heading>
              <IconButton
                aria-label="Add to Queue"
                icon={<MusicSquareSearch size="20px" />}
                size="sm"
                variant="ghost"
                onClick={() => {
                  // @todo show search input
                  setSearch('');
                  searchParams.delete('spotify');
                  setSearchParams(searchParams, {
                    replace: true,
                    state: { scroll: false },
                  });
                }}
              />
            </>
          )}
          {isSearching && (
            <InputGroup>
              <Input
                name="spotify"
                variant="flushed"
                autoComplete="off"
                autoFocus
                size="sm"
                value={search}
                placeholder="joji, willow, ribs, etc"
                // onBlur={() => setIsSearching('')}
                onChange={(e) => {
                  if (e.currentTarget.value.trim()) {
                    setSearch(e.currentTarget.value);
                    submit(e.currentTarget.form);
                  } else {
                    setSearch('');
                    searchParams.delete('spotify');
                    setSearchParams(searchParams, {
                      replace: true,
                      state: { scroll: false },
                    });
                  }
                }}
              />
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
                        setIsSearching('');
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
            </InputGroup>
          )} */}
          <InputGroup>
            <Input
              name="spotify"
              variant="flushed"
              size="sm"
              value={search}
              placeholder="Send a song"
              autoComplete="off"
              borderRadius={3}
              onChange={(e) => {
                if (e.currentTarget.value.trim()) {
                  setSearch(e.currentTarget.value);
                  submit(e.currentTarget.form);
                } else {
                  setSearch('');
                  searchParams.delete('spotify');
                  setSearchParams(searchParams, {
                    replace: true,
                    state: { scroll: false },
                  });
                }
              }}
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
    </>
  );
};

export default Search;
