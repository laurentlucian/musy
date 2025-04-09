import { Link, useLocation } from "react-router";
import { Image } from "~/components/ui/image";

export function Logo() {
  return (
    <Link to="/" className="sm:block! hidden">
      <Image
        src="/logo/musy.png"
        className="h-[50px] w-[100px] object-contain"
        alt="musy"
      />
    </Link>
  );
}
