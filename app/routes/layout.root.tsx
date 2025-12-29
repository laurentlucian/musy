import { Outlet } from "react-router";
import { Nav } from "~/components/domain/nav";

export default function LayoutRoot() {
  return (
    <main className="mx-auto flex max-w-(--breakpoint-2xl) flex-col items-center gap-y-10 py-3 pb-[72px] sm:pb-3 sm:pl-[120px]">
      <Outlet />
      <Nav />
    </main>
  );
}
