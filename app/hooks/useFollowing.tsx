import useCurrentUser from './useCurrentUser';
import useUsers from './useUsers';

const useFollowing = () => {
  const currentUser = useCurrentUser();
  const allUsers = useUsers();

  return allUsers
    .filter((user) => {
      return currentUser?.following.some((follow) => follow.followingId === user.userId);
    })
    .sort((user, prevUser) => {
      if (user.playback === null && prevUser.playback !== null) return 0;
      return currentUser?.favorite?.some(({ favoriteId }) => favoriteId === user.userId) ? -1 : 1;
    });
};

export default useFollowing;
