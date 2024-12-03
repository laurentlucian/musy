import type { PropsWithChildren } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";

export function TrackMenu(
  props: { query: string; uri: string } & PropsWithChildren,
) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Open with</ContextMenuSubTrigger>
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
      </ContextMenuContent>
    </ContextMenu>
  );
}
