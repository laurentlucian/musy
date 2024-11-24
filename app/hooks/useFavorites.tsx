import useCurrentUser from "./useCurrentUser";
import useUsers from "./useUsers";

const useFavorites = () => {
  const currentUser = useCurrentUser();
  const allUsers = useUsers();

  const favorites = allUsers.filter((user) => {
    return currentUser?.favorite.some(
      (friend) => friend.favoriteId === user.userId,
    );
  });
  return favorites;
};

export default useFavorites;
