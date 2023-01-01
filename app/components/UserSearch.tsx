import {
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';
import { Form, Outlet, useSearchParams, useSubmit, useTransition } from '@remix-run/react';
import { CloseSquare } from 'iconsax-react';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { SearchIcon } from '@chakra-ui/icons';

const UserSearch = () => {
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
    <InputGroup size="xs" w="120px">
      <InputLeftElement>
        <SearchIcon color="gray.200" />
      </InputLeftElement>
      <Input disabled rounded="xl" type="search" placeholder="Search" />
    </InputGroup>
  );
};

export default UserSearch;

// const Search = () => {
//

//   return (
//     <>
//       <Form ref={ref} method="get" action="search">
//         {searchParams.get('top-filter') && (
//           <input
//             type="hidden"
//             name="top-filter"
//             value={searchParams.get('top-filter') ?? 'medium-term'}
//           />
//         )}
//         <Flex flex={1} mb={0} align="center">
//           <InputGroup>
//             <Input
//               name="spotify"
//               variant="flushed"
//               size="sm"
//               value={search}
//               placeholder="Send a song"
//               autoComplete="off"
//               borderRadius={0}
//               onChange={onChange}
//               fontSize="15px"
//             />
//             {search && (
//               <InputRightElement
//                 h="35px"
//                 w="65px"
//                 pr={2}
//                 justifyContent="end"
//                 children={
//                   <>
//                     {busy && <Spinner size="xs" mr={2} />}
//                     <IconButton
//                       aria-label="close"
//                       variant="ghost"
//                       size="xs"
//                       borderRadius={8}
//                       onClick={() => {
//                         setSearch('');
//                         searchParams.delete('spotify');
//                         setSearchParams(searchParams, {
//                           replace: true,
//                           state: { scroll: false },
//                         });
//                       }}
//                       icon={<CloseSquare />}
//                     />
//                   </>
//                 }
//               />
//             )}
//           </InputGroup>
//         </Flex>
//       </Form>
//       {search && <Outlet />}
//     </>
//   );
// };

// export default Search;
