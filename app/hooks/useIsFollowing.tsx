import useCurrentUser from './useCurrentUser';

const useIsFollowing = (userId: string) => {
  const currentUser = useCurrentUser();
  const isFollowingDefault = currentUser?.following.find((user) => userId === user.followingId);
  return !!isFollowingDefault;
};

export default useIsFollowing;
