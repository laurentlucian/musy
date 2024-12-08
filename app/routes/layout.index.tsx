import { NavLink, Outlet } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { Button } from "~/components/ui/button";

export default function LayoutIndex() {
  return (
    <Fragment>
      <div className="flex gap-3 *:*:w-full *:flex-1">
        <NavLink
          to="/"
          className="[&[aria-current]>button]:bg-secondary [&[aria-current]]:pointer-events-none"
          end
        >
          {({ isActive }) => {
            return (
              <Button
                key="trending"
                disabled={isActive}
                variant="ghost"
                className="w-full capitalize"
              >
                <p>Trending</p>
              </Button>
            );
          }}
        </NavLink>
        <NavLink
          to="/new"
          className="[&[aria-current]>button]:bg-secondary [&[aria-current]]:pointer-events-none"
          end
        >
          {({ isActive }) => {
            return (
              <Button
                disabled={isActive}
                variant="ghost"
                className="w-full capitalize"
              >
                New
              </Button>
            );
          }}
        </NavLink>
      </div>
      <Outlet />
    </Fragment>
  );
}
