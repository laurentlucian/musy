import type { ActionArgs, LoaderArgs } from '@remix-run/node';

import { Button, Heading, Stack, Image } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import AcceptOrRejectFriendButton from '~/components/friends/AcceptOrRejectFriendButton';
import PendingFriendsContainer from '~/components/friends/PendingFriendsContainer';
import AddFriendsButton from '~/components/profile/AddFriendsButton';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

//return a list of pending friend requests
//front end?

//load buttons to accept or decline friend requests

//TODO: state of pending friends requests (update page when friend request comes in)
//CREATE A TAB NEXT TO FRIENDS ON /HOME/FRIENDS THAT NAVIGATES TO THIS PAGE..

const PendingFriends = () => {
  const { currentUser, friendProfiles, friendsList } = useTypedLoaderData<typeof loader>();

  // <Stack>
  //   <Heading>
  //     {friendsList.map((friend) => {
  //       return (
  //         friend.userId +
  //         ',' +
  //       );
  //     })}
  //   </Heading>
  // </Stack>

  return (
    <Stack>
      <Heading>Friend Requests</Heading>
      {friendProfiles.map((pendingFriend) => {
        return (
          <PendingFriendsContainer
            key={pendingFriend.userId}
            image={pendingFriend.image}
            name={pendingFriend.name}
            userId={pendingFriend.userId}
          />
        );
      })}
    </Stack>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;

  //   const user = await prisma.profile.findUnique({
  //     include: { ai: true, settings: true, theme: true },
  //     where: { userId: currentUser?.id },
  //   });

  //load a list of pending friend requests of the current user
  const friendsList = await prisma.friends.findMany({
    where: {
      friendId: currentUser?.id,
      status: 'pending',
    },
  });

  //fetch a list of profiles from the database using the userIds from the friendsList
  const friendProfiles = await prisma.profile.findMany({
    where: {
      userId: {
        in: friendsList.map((friend) => {
          return friend.userId;
        }),
      },
    },
  });

  //console log all of the names of the friendProfiles
  return typedjson({
    currentUser,
    friendProfiles,
    friendsList,
  });
};

export const action = async ({ params, request }: ActionArgs) => {
  //const id = params.id;
  //invariant(id, 'Missing params id');

  const session = await authenticator.isAuthenticated(request);
  const currentUser = session?.user ?? null;
  const id = currentUser?.id;

  const data = await request.formData();
  const friendId = data.get('friendId');
  const clickStatus = data.get('clickStatus');

  console.log('in action pending friends: ' + typeof friendId + ' ' + clickStatus);
  const test = clickStatus === 'rejected';
  console.log(test);
  //if the user clicks the accept button, update the status of the friend request to accepted
  if (typeof friendId === 'string') {
    if (clickStatus === 'accepted') {
      console.log('in accept');
      await prisma.friends.update({
        data: {
          status: 'accepted',
        },
        where: {
          userId_friendId: {
            friendId: id!,
            userId: friendId,
          },
        },
      });

      await prisma.friends.create({
        data: {
          friendId: friendId!,
          status: 'accepted'!,
          userId: id!,
        },
      });
    } else if (clickStatus === 'rejected') {
      console.log('in reject');
      await prisma.friends.delete({
        where: {
          userId_friendId: {
            friendId: id!,
            userId: friendId,
          },
        },
      });
    }
  }

  return null;
};

export default PendingFriends;
