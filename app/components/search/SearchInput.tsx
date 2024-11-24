import { useNavigation, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "react-feather";

import { useMobileKeyboardActions } from "~/hooks/useMobileKeyboardCheck";
import { cn } from "~/lib/cn";
import Waver from "~/lib/icons/Waver";

type SearchInputProps = {
  param: string;
} & JSX.IntrinsicElements["input"];

const SearchInput = ({ autoFocus, className, ...props }: SearchInputProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get(props.param) || "");
  const { hideMenu, showMenu } = useMobileKeyboardActions();
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "loading" &&
    navigation.location.search.includes(`?${props.param}=`);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const setSearchURL = (search: string) => {
    setSearchParams(
      {
        // allow search input to reused in different screens without triggering others; eg: /explore search and fullscreen search
        // by using the param as the key, we can have multiple search inputs without them conflicting
        param: props.param,
        [props.param]: search,
      },
      {
        replace: true,
        state: { scroll: false },
      },
    );
  };

  const removeSearchURL = () => {
    searchParams.delete("param");
    searchParams.delete(props.param);
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
  };

  useEffect(() => {
    return () => {
      removeSearchURL();
    };
  }, []);

  return (
    <div
      className={cn(
        "relative isolate z-10 flex w-full overflow-y-hidden",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 top-0 left-2 flex w-fit items-center justify-start">
        <button
          type="button"
          aria-label="search"
          className="flex cursor-pointer select-none items-center justify-center whitespace-nowrap p-0 text-musy"
        >
          <Search size={20} />
        </button>
      </div>
      <input
        className="w-full rounded bg-transparent px-9 py-2 text-[14px] transition-all duration-300 ease-in-out focus:outline-musy-100"
        name="spotify"
        value={search}
        placeholder="Search"
        autoComplete="off"
        onChange={(e) => {
          const search = e.currentTarget.value;
          setSearch(search);
          if (search.trim().length) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              setSearchURL(search);
            }, 100);
          } else {
            removeSearchURL();
          }
        }}
        onFocus={hideMenu}
        onBlur={showMenu}
      />
      {search && (
        <div className="absolute top-0 right-1 bottom-0 flex items-center justify-center">
          {isLoading && <Waver />}
          <button
            type="button"
            className="mr-1 rounded"
            aria-label="close"
            onClick={() => {
              setSearch("");
              removeSearchURL();
            }}
          >
            <X />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
