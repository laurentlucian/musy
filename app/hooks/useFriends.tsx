import useSessionUser from './useSessionUser';
import useUsers from './useUsers';

const useFriends = () => {
  const currentUser = useSessionUser();
  const allUsers = useUsers();

  return allUsers
    .filter((user) => {
      return currentUser?.friendsList.some((friend) => friend.friendId === user.userId);
    })
    .sort((user, prevUser) => {
      if (user.playback === null && prevUser.playback !== null) return 0;
      return currentUser?.favorite?.some(({ favoriteId }) => favoriteId === user.userId) ? -1 : 1;
    });
};

export default useFriends;
