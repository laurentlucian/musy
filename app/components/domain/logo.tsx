import { Link } from "react-router";
export function Logo() {
  return (
    <Link to="/" className="brand flex items-center" aria-label="Musy home">
      <img src="/logo/musy-128.png" alt="" className="size-8" />
    </Link>
  );
}
