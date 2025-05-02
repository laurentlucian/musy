import type { Track as TrackType } from "@lib/services/db.server";
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
import type { action } from "~/routes/resources/actions";
import { Image } from "../ui/image";

export function Track(
  props: {
    track: TrackType;
  } & React.ComponentProps<"a">,
) {
  const { track, className, ...rest } = props;
  return (
    <TrackMenu
      query={encodeURIComponent(`${track.name} ${track.artist}`.toLowerCase())}
      uri={track.uri}
    >
      <Link
        className={cn(
          "flex flex-1 gap-x-2 rounded-md bg-card px-3.5 py-3 transition-colors duration-150 hover:bg-accent",
          className,
        )}
        to={`/track/${track.id}`}
        viewTransition
        {...rest}
      >
        <TrackImage
          id={track.id}
          src={track.image}
          alt={track.name}
          width={80}
          height={80}
        />
        <div>
          <TrackName name={track.name} />
          <TrackArtist artist={track.artist} />
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
  const fetcher = useFetcher<typeof action>();
  useFetcherToast(fetcher.data?.error, fetcher.data?.type);

  const submit = (action: string, provider: string) => {
    fetcher.submit(
      { provider, uri: props.uri },
      { method: "post", action: `/actions/${action}` },
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        {/* <_TrackMenuWithProviders submit={submit} {...props} /> */}
        <ContextMenuItem
          onClick={() => {
            window.open(props.uri, "_blank");
          }}
        >
          Open
        </ContextMenuItem>
        <ContextMenuItem onClick={() => submit("like", "spotify")}>
          Like
        </ContextMenuItem>{" "}
        <ContextMenuItem onClick={() => submit("queue", "spotify")}>
          Queue
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => submit("thanks", "spotify")}>
          Thanks
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function _TrackMenuWithProviders({
  submit,
  ...props
}: {
  query: string;
  uri: string;
  submit: (action: string, provider: string) => void;
}) {
  return (
    <>
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
          <ContextMenuItem onClick={() => submit("like", "spotify")}>
            Spotify
          </ContextMenuItem>
          <ContextMenuItem onClick={() => submit("like", "google")}>
            Youtube
          </ContextMenuItem>
          <ContextMenuItem disabled>Apple</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub>
        <ContextMenuSubTrigger>Queue</ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-48">
          <ContextMenuItem onClick={() => submit("queue", "spotify")}>
            Spotify
          </ContextMenuItem>
          <ContextMenuItem disabled>Youtube</ContextMenuItem>
          <ContextMenuItem disabled>Apple</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </>
  );
}
