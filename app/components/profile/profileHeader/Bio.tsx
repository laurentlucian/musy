import { useTypedFetcher } from "remix-typedjson";

import useIsMobile from "~/hooks/useIsMobile";
import { cn } from "~/lib/cn";
import type { action as bioAction } from "~/routes/api+/user+/profile+/bio";

const Bio = ({
  bio,
  isOwnProfile,
}: { bio: string | null; isOwnProfile: boolean }) => {
  const fetcher = useTypedFetcher<typeof bioAction>();
  const isSmallScreen = useIsMobile();

  const updateBio = (bio: string) => {
    fetcher.submit(
      { bio },
      { action: "/api/user/profile/bio", method: "POST" },
    );
  };

  return isOwnProfile ? (
    <textarea
      name="bio"
      className={cn(
        "resize-none overflow-hidden border-musy border-b bg-transparent px-1 py-1 text-[12px] text-musy placeholder:text-musy-200 placeholder:opacity-50 focus:outline-musy-200 md:text-[14px]",
        {
          "w-1/2": !isSmallScreen,
          "w-full": isSmallScreen,
        },
      )}
      defaultValue={bio ?? ""}
      placeholder="write something :)"
      onBlur={(e) => updateBio(e.currentTarget.value)}
      maxLength={74}
      rows={2}
      spellCheck={false}
    />
  ) : (
    <p
      className={cn(
        "h-full min-h-5 w-full whitespace-normal break-all pt-5 text-xs md:text-[14px]",
        {
          "w-1/2": !isSmallScreen,
          "w-full": isSmallScreen,
        },
      )}
      spellCheck={false}
    >
      {bio}
    </p>
  );
};

export default Bio;
