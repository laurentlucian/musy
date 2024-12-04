import { ContextMenuTrigger } from "@radix-ui/react-context-menu";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { ContextMenu } from "~/components/ui/context-menu";
import { Image } from "~/components/ui/image";

const VARIATIONS = {
  "1": "/logo/musy-1.png",
} as const;

export function Logo() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const variation = params.get("v");
  let url = "/logo/musy.png";
  if (variation && variation in VARIATIONS) {
    url = VARIATIONS[variation as keyof typeof VARIATIONS];
  }

  return (
    <ContextMenu
      onOpenChange={(open) => {
        open && variation !== "1" ? navigate("/?v=1") : navigate("/");
      }}
    >
      <ContextMenuTrigger asChild>
        <Link to={pathname === "/" ? "/account" : "/"}>
          <Image
            src={url}
            className="h-[150px] w-[200px] object-contain"
            alt="musy"
          />
        </Link>
      </ContextMenuTrigger>
    </ContextMenu>
  );
}
