import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";

export function RootMenu() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="-z-10 absolute inset-0 select-none" />
      <ContextMenuContent>
        <ContextMenuItem>musy</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
