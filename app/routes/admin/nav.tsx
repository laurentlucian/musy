import { Fragment } from "react";
import { NavLink } from "react-router";
import { Button } from "~/components/ui/button";

export function AdminNav() {
  return (
    <Fragment>
      <NavLink
        to="/account/admin/transfers"
        className="[&[aria-current]>button]:bg-secondary [&[aria-current]]:pointer-events-none"
      >
        {({ isActive }) => {
          return (
            <Button
              disabled={isActive}
              variant="ghost"
              className="w-full capitalize"
            >
              <p>Transfers</p>
            </Button>
          );
        }}
      </NavLink>
      <NavLink
        to="/account/admin/syncs"
        className="[&[aria-current]>button]:bg-secondary [&[aria-current]]:pointer-events-none"
      >
        {({ isActive }) => {
          return (
            <Button
              disabled={isActive}
              variant="ghost"
              className="w-full capitalize"
            >
              <p>Syncs</p>
            </Button>
          );
        }}
      </NavLink>
    </Fragment>
  );
}
