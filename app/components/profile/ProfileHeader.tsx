import { Form, useSearchParams, useSubmit } from '@remix-run/react';
import { MoreHorizontal, MoreVertical } from 'react-feather';

import { NotAllowedIcon } from '@chakra-ui/icons';
import {
  Heading,
  HStack,
  Stack,
  Text,
  Image,
  Textarea,
  Flex,
  VStack,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';

import { CodeCircle, LockCircle, Menu } from 'iconsax-react';
import { useTypedRouteLoaderData } from 'remix-typedjson';

import Following from '~/components/profile/Following';
import MoodButton from '~/components/profile/MoodButton';
import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';
import type { loader } from '~/routes/$id';

// import SpotifyLogo from '../icons/SpotifyLogo';
import QuickActions from '../player/home/QuickActions';
import Favorite from './Favorite';
import ProfileActions from './ProfileActions';
import Search from './Search';

const ProfileHeader = ({ isPrivate }: { isPrivate?: boolean }) => {
  const data = useTypedRouteLoaderData<typeof loader>('routes/$id');
  const [params, setParams] = useSearchParams();
  const submit = useSubmit();
  const isSmallScreen = useIsMobile();
  if (!data) return null;

  const { currentUser, following, listened, user } = data;
  const isOwnProfile = currentUser?.userId === user.userId;

  const ProfilePic = (
    <Tooltip label="<3" placement="top" hasArrow>
      <Image
        borderRadius="full"
        minW={[150, 150, 200]}
        maxW={[150, 150, 200]}
        minH={[150, 150, 200]}
        maxH={[150, 150, 200]}
        src={user.image}
        mr={[0, '10px']}
        zIndex={1}
      />
    </Tooltip>
  );
  const Username = (
    <HStack>
      <Heading
        size={user.name.length > 10 ? 'lg' : user.name.length > 16 ? 'md' : 'xl'}
        fontWeight="bold"
        textAlign="left"
      >
        {user.name}
      </Heading>
      {isPrivate && (
        <Tooltip label="Private" placement="top" hasArrow>
          <LockCircle size="32" variant="Bulk" />
        </Tooltip>
      )}
      {user.settings?.founder === true && (
        <>
          <Tooltip label="Dev" placement="top" hasArrow>
            <CodeCircle size="32" variant="Bulk" />
          </Tooltip>
          {/* Founder Icon if needed maybe a musy icon down the line for founders????????? */}
          {/* <Tooltip label="Founder" placement="top" hasArrow>
            <Nebulas size="32" variant="Bulk" />
          </Tooltip> */}
        </>
      )}
    </HStack>
  );

  const Bio =
    user.id === currentUser?.id ? (
      <Stack w="100%" minW="100%" maxW="100%" pt="20px">
        <Form method="post" replace>
          <Textarea
            name="bio"
            size="md"
            variant="flushed"
            defaultValue={user.bio ?? ''}
            placeholder="write something :)"
            onBlur={(e) => submit(e.currentTarget.form)}
            resize="none"
            maxLength={75}
            rows={2}
            py={0}
            focusBorderColor="spotify.green"
            w={isSmallScreen ? '100%' : '50%'}
            spellCheck={false}
            h="100%"
            minH="20px"
            overflow="hidden"
          />
          <Textarea
            name="component"
            size="xs"
            variant="unstyled"
            defaultValue={user.settings?.easterEgg === true ? '69' : ''}
            textColor={user.settings?.easterEgg === true ? 'rgba(0, 0, 0, 0)' : undefined}
            resize="none"
            w="20px"
            h="20px"
            overflow="hidden"
            cursor="default"
            pos="absolute"
            bottom={0}
            left="50%"
            onBlur={(e) => submit(e.currentTarget.form)}
          />
        </Form>
      </Stack>
    ) : (
      <Text
        fontSize="14px"
        noOfLines={3}
        whiteSpace="normal"
        wordBreak="break-word"
        w="100%"
        spellCheck={false}
        h="100%"
        minH="20px"
        pt="20px"
      >
        {user.bio}
      </Text>
    );
  const Mood = currentUser ? <MoodButton mood={user.ai?.mood} since={user.ai?.updatedAt} /> : null;

  const timeframe = params.get('listened') === 'week' ? '7d' : '24h';
  const SubHeader = (
    <HStack spacing={[3, 5]} position="relative">
      {Mood}
      <Tooltip label="hours listened" placement="bottom-end" hasArrow>
        <Flex
          align="baseline"
          pt="1px"
          cursor="pointer"
          onClick={() => {
            if (params.get('listened') === 'week') {
              params.delete('listened');
              setParams(params);
            } else {
              setParams({ listened: 'week' });
            }
          }}
        >
          <Text fontSize="13px" mr="8px">
            {listened}
          </Text>
          <Text as="span" fontSize="10px" opacity={0.5}>
            /&nbsp; {timeframe}
          </Text>
        </Flex>
      </Tooltip>
    </HStack>
  );

  const FollowButton =
    currentUser && following !== null && !isOwnProfile ? <Following following={following} /> : null;

  const FavButton = !isOwnProfile ? <Favorite favorite={true} /> : null;

  const MenuBttn = !isOwnProfile ? (
    <Menu>
      <MenuButton as={IconButton} icon={<NotAllowedIcon />} aria-label="more" variant="unstyled" />
      <MenuList>
        <MenuItem icon={<NotAllowedIcon />}>block user</MenuItem>
      </MenuList>
    </Menu>
  ) : null;

  const test = !isOwnProfile ? <ProfileActions /> : null;

  return (
    <VStack mb="40px" alignItems="baseline" ml={['0px', '20px']} pl={['15px', 0]} w="100%">
      <HStack>
        {ProfilePic}
        <VStack align="left" pos="relative" top="20px" left="10px">
          <HStack>{Username}</HStack>
          <VStack justify="flex-end" align="inherit" pr={['10px', 0]}>
            <HStack>
              {FollowButton}
              {FavButton}
              {test}
            </HStack>
            {SubHeader}
          </VStack>
        </VStack>
      </HStack>
      {Bio}
      {!isOwnProfile && (
        <Stack w="97%" pos="relative" top="30px" pb="20px">
          <Search />
        </Stack>
      )}
    </VStack>
  );
};

export default ProfileHeader;
