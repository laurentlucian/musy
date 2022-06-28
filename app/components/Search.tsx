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
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

type SearchType = {
  isSearching: boolean;
  setIsSearching: (T: boolean) => void;
};

const Search = ({ isSearching, setIsSearching }: SearchType) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const transition = useTransition();
  const search = searchParams.get('spotify');
  const formRef = useRef<HTMLFormElement>(null);
  const busy = transition.submission?.formData.has('spotify') ?? false;

  return (
    <>
      <Form ref={formRef} method="get" action="search">
        <Flex flex={1} align="center">
          {!isSearching && (
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
                  setIsSearching(true);
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
                defaultValue={search ?? ''}
                placeholder="joji, willow, ribs, etc"
                // onBlur={() => setIsSearching(false)}
                onChange={(e) => {
                  if (e.currentTarget.value.trim()) {
                    submit(e.currentTarget.form);
                    setIsSearching(true);
                  } else {
                    setIsSearching(false);
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
                    <CloseSquare
                      onClick={() => {
                        setIsSearching(false);
                        searchParams.delete('spotify');
                        setSearchParams(searchParams, {
                          replace: true,
                          state: { scroll: false },
                        });
                      }}
                    />
                  </>
                }
              />
            </InputGroup>
          )}
          {/* <Input
                    name="spotify"
                    size="sm"
                    defaultValue={search ?? ''}
                    placeholder="Add to queue"
                    autoComplete="off"
                    borderRadius={3}
                    onChange={(e) => {
                      if (e.currentTarget.value.trim()) {
                        submit(e.currentTarget.form);
                        setIsSearching(true);
                      } else {
                        setIsSearching(false);
                        searchParams.delete('spotify');
                        setSearchParams(searchParams, {
                          replace: true,
                          state: { scroll: false },
                        });
                      }
                    }}
                    fontSize="15px"
                  /> */}
        </Flex>
      </Form>
    </>
  );
};

export default Search;
