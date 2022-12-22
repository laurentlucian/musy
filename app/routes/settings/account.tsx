import {
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  type ModalProps,
} from '@chakra-ui/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import { type LoaderArgs } from '@remix-run/server-runtime';
import { authenticator } from '~/services/auth.server';
import { Form, useLocation } from '@remix-run/react';
import { prisma } from '~/services/db.server';
import Tooltip from '~/components/Tooltip';
import { Logout } from 'iconsax-react';
import { useRef } from 'react';

const Account = () => {
  const { currentUser } = useTypedLoaderData<typeof loader>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { pathname, search } = useLocation();
  const cancelRef = useRef<any>(); //idk how to fix these type errors
  return (
    <>
      {!!currentUser && (
        <>
          <Tooltip label="Logout">
            <Button
              aria-label="logout"
              name="logout"
              leftIcon={<Logout />}
              variant="ghost"
              bgColor="red"
              color="white"
              _hover={{ bgColor: 'red.500' }}
              onClick={onOpen}
            >
              Logout
            </Button>
          </Tooltip>
          <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Log Out
                </AlertDialogHeader>
                <AlertDialogBody>Are you sure you want to logout?</AlertDialogBody>
                <AlertDialogFooter>
                  <Form action={'/logout'} method="post">
                    <input type="hidden" value={pathname + search} name="redirectTo" />
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
      )}
    </>
  );
};
export default Account;
export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const cookie = request.headers.get('cookie') ?? '';
  const isMobile = request.headers.get('user-agent')?.includes('Mobile') ?? false;

  if (session && session.user) {
    const currentUser = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    return typedjson({ currentUser, cookie, isMobile });
  } else {
    return typedjson({ currentUser: null, cookie, isMobile });
  }
};
