import { NavLink } from "react-router";

export function AdminNav() {
  return (
    <nav
      aria-label="Administration"
      className="flex flex-wrap gap-1 md:flex-col"
    >
      {[
        ["users", "People"],
        ["counts", "Catalog"],
        ["syncs", "Sync activity"],
        ["scripts", "Maintenance"],
      ].map(([path, label]) => (
        <NavLink
          key={path}
          to={`/settings/admin/${path}`}
          className={({ isActive }) =>
            `rounded-md px-3 py-2.5 text-sm transition-colors ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
