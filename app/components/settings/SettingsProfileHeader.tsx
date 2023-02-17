import { Form, useSubmit } from '@remix-run/react';

import { Box, Flex, Heading, HStack, Image, Stack, Text, Textarea } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';

import useIsMobile from '~/hooks/useIsMobile';

const SettingsProfileHeader = ({ profile }: { profile: Profile }) => {
  const submit = useSubmit();
  const isSmallScreen = useIsMobile();

  const SubHeader = (
    <HStack spacing={[3, 5]} position="relative">
      <Text fontSize="13px" mr="8px">
        Mood
      </Text>
      <Flex align="baseline" pt="1px" cursor="pointer">
        <Text fontSize="13px" mr="8px">
          time listened
        </Text>
        <Text as="span" fontSize="10px" opacity={0.5}>
          /&nbsp; 24hr
        </Text>
      </Flex>
    </HStack>
  );

  const Bio = (
    <Stack w="100%" minW="100%" maxW="100%" pt="4px">
      <Form method="post" replace>
        <Textarea
          name="bio"
          size="md"
          variant="flushed"
          defaultValue={profile.bio ?? ''}
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
      </Form>
    </Stack>
  );

  return (
    <Stack ml="10px" mt="20px">
      <HStack>
        <Image src={profile.image} boxSize="120px" borderRadius="full" />
        <HStack>
          <Stack>
            <Box h="20px" />
            <Heading
              size={profile.name.length > 10 ? 'lg' : profile.name.length > 16 ? 'md' : 'xl'}
              fontWeight="bold"
              textAlign="left"
            >
              {profile.name}
            </Heading>
            {SubHeader}
          </Stack>
        </HStack>
      </HStack>
      {Bio}
    </Stack>
  );
};

export default SettingsProfileHeader;
