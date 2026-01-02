import { Fragment } from "react";
import { NavLinkSub } from "~/components/domain/nav";

export function AdminNav() {
  return (
    <Fragment>
      <NavLinkSub to="/settings/admin/users">users</NavLinkSub>
      <NavLinkSub to="/settings/admin/counts">counts</NavLinkSub>
      <NavLinkSub to="/settings/admin/syncs">syncs</NavLinkSub>
      <NavLinkSub to="/settings/admin/scripts">scripts</NavLinkSub>
    </Fragment>
  );
}
