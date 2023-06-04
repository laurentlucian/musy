import useSessionUser from './useSessionUser';

const useIsFollowing = (userId: string) => {
  const currentUser = useSessionUser();
  const isFollowingDefault = currentUser?.following.find((user) => userId === user.followingId);
  return !!isFollowingDefault;
};

export default useIsFollowing;
