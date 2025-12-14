"use client";

import type { PropsWithChildren } from "react";
import { Link, useFetcher } from "react-router";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import type { Track as TrackType } from "~/lib/services/db.server";
import { cn } from "~/lib/utils";
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
          <TrackName name={track.name} uri={track.uri} />
          <TrackArtist artist={track.artist} uri={track.artistUri} />
        </div>
      </Link>
    </TrackMenu>
  );
}

export function TrackName(
  props: { name: string; uri: string } & React.ComponentProps<"a">,
) {
  const { name, className, uri, ...rest } = props;
  return (
    <a
      className={cn(
        "line-clamp-2 cursor-pointer text-ellipsis font-medium hover:underline",
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
      href={uri}
      onClick={(event) => {
        event.stopPropagation();
      }}
      {...rest}
    >
      {name}
    </a>
  );
}

export function TrackArtist(
  props: { artist: string; uri: string } & React.ComponentProps<"a">,
) {
  const { artist, className, uri, ...rest } = props;
  return (
    <a
      className={cn(
        "cursor-pointer text-muted-foreground text-sm hover:underline",
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
      href={uri}
      onClick={(event) => {
        event.stopPropagation();
      }}
      {...rest}
    >
      {artist}
    </a>
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
