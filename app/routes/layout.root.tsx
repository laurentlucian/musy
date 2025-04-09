import { Outlet } from "react-router";
import { Logo } from "~/components/domain/logo";
import { RootMenu } from "~/components/menu/root";

export default function LayoutRoot() {
  return (
    <main className="relative isolate mx-auto flex max-w-(--breakpoint-2xl) flex-1 flex-col items-center gap-y-10 bg-transparent py-10">
      <RootMenu />
      <Logo />
      <Outlet />
    </main>
  );
}
