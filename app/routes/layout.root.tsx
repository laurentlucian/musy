import { Outlet } from "react-router";
import { Logo } from "~/components/domain/logo";
import { Nav } from "~/components/domain/nav";
import { RootMenu } from "~/components/menu/root";

export default function LayoutRoot() {
  return (
    <main className="relative isolate mx-auto flex max-w-(--breakpoint-2xl) flex-1 flex-col items-center gap-y-10 bg-transparent py-3 pb-[72px] sm:pb-3 sm:pl-[120px]">
      <RootMenu />
      <Outlet />
      <Nav />
    </main>
  );
}
