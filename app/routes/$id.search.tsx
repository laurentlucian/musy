import { spotifyApi } from '~/services/spotify.server';
import { redirect } from '@remix-run/node';
import { Form, Link, useLoaderData, useSubmit } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { Button, HStack, Image, Input, Stack, Text, VStack } from '@chakra-ui/react';

const Search = () => {
  const response = useLoaderData<SpotifyApi.TrackSearchResponse | null>();
  const submit = useSubmit();
  const tracks = response?.tracks.items ?? [];

  return (
    <Stack height={['100vh']} width={['100%']}>
      <HStack>
        <Button as={Link} to={`/${'1295028670'}`}>
          -
        </Button>
        <Form method="get">
          <Input
            type="search"
            id="search"
            name="spotify"
            placeholder="songs"
            onChange={(e) => submit(e.currentTarget.form)}
            h="30px"
            w="287.87px"
          />
        </Form>
        <Button px={0} variant="ghost">
          {/* <Image src={speech_to_text} boxSize="24px" /> */}
        </Button>
      </HStack>
      {tracks?.map((track) => (
        <Button
          as={Link}
          to={`/${'1295028670'}`}
          key={track.id}
          display="flex"
          justifyContent="flex-start"
          variant="ghost"
          h="50px"
          outline="transparent"
          boxShadow="red"
          // css={{ webkitTapHighlightColor: 'rgba(0,0,0,0)' }}
        >
          <HStack justify="flex-start">
            <Image src={track.album.images[1].url} boxSize="50px" ml="-11px" />
            <VStack align="flex-start" justify="flex-start">
              <Text fontSize="13px">{track.name}</Text>
              <Text fontSize="13px">{track.artists[0].name}</Text>
            </VStack>
          </HStack>
        </Button>
      ))}
    </Stack>
  );
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const id = params.id;
  if (!id) throw redirect('/');
  const { spotify } = await spotifyApi(id);
  if (!spotify) return null;
  const url = new URL(request.url);
  const search = url.searchParams.get('spotify');
  if (!search) return null;

  const { body: searchTrack } = await spotify.searchTracks(search);

  return searchTrack;
};

export default Search;

// import type { Profile as ProfileType } from '@prisma/client';
// import { spotifyApi } from '~/services/spotify.server';
// import { Form, Link, redirect, useLoaderData, useSubmit } from 'remix';
// import type { LoaderFunction } from 'remix';
// import { Button, HStack, Image, Input, Stack, Text, VStack } from '@chakra-ui/react';

// const Search = () => {
//   const { user, searchTrack } = useLoaderData<{
//     user: ProfileType | null;
//     searchTrack: SpotifyApi.TrackSearchResponse | null;
//   }>();
//   const submit = useSubmit();
//   const tracks = searchTrack?.tracks.items ?? [];

//   return (
//     <Stack height={['100vh']} width={['100%']}>
//       {/* <HStack> */}
//         {/* <Button as={Link} to={`/${user?.userId}`}>
//           -
//         </Button> */}
//         <Form method="get">
//           <Input
//             type="search"
//             id="search"
//             name="spotify"
//             placeholder="songs"
//             onChange={(e) => submit(e.currentTarget.form)}
//             h="30px"
//             w="100%"
//           />
//         </Form>
//       {/* </HStack> */}
//       {tracks?.map((track) => (
//         <VStack key={track.id} align="flex-start" py="3px">
//           <HStack justify="flex-start">
//             <Image src={track.album.images[1].url} boxSize="50px" />
//             <VStack align="flex-start" justify="flex-start">
//               <Text fontSize="13px">{track.name}</Text>
//               <Text fontSize="13px">{track.artists[0].name}</Text>
//             </VStack>
//           </HStack>
//         </VStack>
//       ))}
//     </Stack>
//   );
// };

// export const loader: LoaderFunction = async ({ request, params }) => {
//   const id = params.id;
//   if (!id) throw redirect('/');

//   const { spotify, user } = await spotifyApi(id);
//   if (!spotify) return null;

//   const url = new URL(request.url);
//   const search = url.searchParams.get('spotify');
//   if (!search) return null;

//   const { body: searchTrack } = await spotify.searchTracks(search);

//   return { user, searchTrack };
// };
