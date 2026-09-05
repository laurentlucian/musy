import { Link } from "react-router";
export function Logo() {
  return (
    <Link to="/" className="brand font-semibold" aria-label="Musy home">
      musy
    </Link>
  );
}
