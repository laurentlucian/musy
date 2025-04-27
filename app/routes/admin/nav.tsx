import { Fragment } from "react";
import { NavLinkSub } from "~/components/domain/nav";

export function AdminNav() {
  return (
    <Fragment>
      <NavLinkSub to="/account/admin/syncs">syncs</NavLinkSub>
      <NavLinkSub to="/account/admin/transfers">transfers</NavLinkSub>
    </Fragment>
  );
}
