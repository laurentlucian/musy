import {
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stack,
  Switch,
  FormLabel,
  FormControl,
} from '@chakra-ui/react';
import { Form, useSubmit } from '@remix-run/react';
import type { ActionArgs } from '@remix-run/server-runtime';
import { Logout } from 'iconsax-react';
import { useRef } from 'react';
import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';
import useSessionUser from '~/hooks/useSessionUser';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Account = () => {
  const currentUser = useSessionUser();
  const submit = useSubmit();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null); //idk how to fix these type errors
  if (!currentUser) return null;

  return (
    <>
      <Stack spacing={10}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="auto-scroll" mb="0">
            Auto Scroll
          </FormLabel>
          <Switch
            colorScheme="music"
            id="auto-scroll"
            defaultChecked={currentUser.settings?.autoscroll ?? true}
            onChange={(e) => {
              submit(
                { autoscroll: `${e.target.checked}` },

                { method: 'post', replace: true },
              );
            }}
          />
        </FormControl>
        <Button
          leftIcon={<Logout />}
          bgColor="red.600"
          color="white"
          _hover={{ bgColor: 'red.500' }}
          onClick={onOpen}
        >
          Logout
        </Button>
      </Stack>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Log Out
            </AlertDialogHeader>
            <AlertDialogBody>Are you sure you want to logout?</AlertDialogBody>
            <AlertDialogFooter>
              <Form action={'/logout'} method="post">
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  bgColor="red"
                  color="white"
                  onClick={onClose}
                  ml={3}
                  type="submit"
                  _hover={{ bgColor: 'red.500' }}
                >
                  Log Out
                </Button>
              </Form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export const action = async ({ request }: ActionArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const userId = session?.user?.id;
  invariant(userId, 'Unauthenticated');

  const data = await request.formData();
  const autoscroll = data.get('autoscroll') === 'true';
  console.log('autoscroll', autoscroll);

  if (typeof autoscroll !== 'boolean') {
    return typedjson('Form submitted incorrectly');
  }

  const user = await prisma.settings.upsert({
    where: { userId },
    create: { autoscroll, userId },
    update: { autoscroll },
  });
  return user;
};

export default Account;
