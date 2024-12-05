import { cn } from "@lib/utils";
import type { PropsWithChildren } from "react";
import { Link, useFetcher } from "react-router";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { useFetcherToast } from "~/hooks/useFetcherToast";
import type { action } from "~/routes/actions";
import { Image } from "../ui/image";

export function Track(
  props: {
    image: string;
    artist: string;
    name: string;
    id: string;
    uri: string;
  } & React.ComponentProps<"a">,
) {
  const { image, artist, name, id, uri, className, ...rest } = props;
  return (
    <TrackMenu
      query={encodeURIComponent(`${name} ${artist}`.toLowerCase())}
      uri={uri}
    >
      <Link
        className={cn(
          "flex flex-1 gap-x-2 rounded-md bg-primary-foreground px-3.5 py-3 transition-colors duration-150 hover:bg-accent",
          className,
        )}
        to={`/track/${id}`}
        viewTransition
        {...rest}
      >
        <TrackImage id={id} src={image} alt={name} width={80} height={80} />
        <div>
          <TrackName name={name} />
          <TrackArtist artist={artist} />
        </div>
      </Link>
    </TrackMenu>
  );
}

export function TrackName(props: { name: string } & React.ComponentProps<"p">) {
  const { name, className, ...rest } = props;
  return (
    <p
      className={cn("line-clamp-2 text-ellipsis font-medium", className)}
      {...rest}
    >
      {name}
    </p>
  );
}

export function TrackArtist(
  props: { artist: string } & React.ComponentProps<"p">,
) {
  const { artist, className, ...rest } = props;
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...rest}>
      {artist}
    </p>
  );
}

export function TrackImage(
  props: React.ComponentProps<"img"> & { id: string },
) {
  const { className, id, ...rest } = props;
  return (
    <Image
      className={cn("rounded-md", className)}
      style={{
        viewTransitionName: `track-image-${id}`,
      }}
      {...rest}
    />
  );
}

export function TrackMenu(
  props: { query: string; uri: string } & PropsWithChildren,
) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Open</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem
              onClick={() => {
                window.open(props.uri, "_blank");
              }}
            >
              Spotify
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                const url = `https://music.youtube.com/search?q=${props.query}`;
                window.open(url, "_blank");
              }}
            >
              Youtube
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                const url = `https://music.apple.com/search?term=${props.query}`;
                window.open(url, "_blank");
              }}
            >
              Apple
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Like</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <LikeOnSpotify uri={props.uri} />
            <LikeOnYoutube uri={props.uri} />
            <ContextMenuItem disabled>Apple</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <Thanks uri={props.uri} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

function LikeOnSpotify(props: { uri: string }) {
  const fetcher = useFetcher<typeof action>();
  useFetcherToast(fetcher.data?.error, "liked");

  return (
    <ContextMenuItem
      onClick={() => {
        fetcher.submit(
          {
            uri: props.uri,
            provider: "spotify",
          },
          {
            action: "/actions/like",
            method: "post",
          },
        );
      }}
    >
      Spotify
    </ContextMenuItem>
  );
}

function LikeOnYoutube(props: { uri: string }) {
  const fetcher = useFetcher<typeof action>();
  useFetcherToast(fetcher.data?.error, "liked");

  return (
    <ContextMenuItem
      onClick={() => {
        fetcher.submit(
          {
            uri: props.uri,
            provider: "google",
          },
          {
            action: "/actions/like",
            method: "post",
          },
        );
      }}
    >
      Youtube
    </ContextMenuItem>
  );
}

function Thanks(props: { uri: string }) {
  const fetcher = useFetcher<typeof action>();
  useFetcherToast(fetcher.data?.error, "thanked");

  return (
    <ContextMenuItem
      onClick={() => {
        fetcher.submit(
          {
            uri: props.uri,
            provider: "google",
          },
          {
            action: "/actions/thanks",
            method: "post",
          },
        );
      }}
    >
      Thanks
    </ContextMenuItem>
  );
}
