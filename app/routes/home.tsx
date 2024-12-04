import { ContextMenuTrigger } from "@radix-ui/react-context-menu";
import { Suspense, use } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { RootMenu } from "~/components/menu/root";
import { ContextMenu } from "~/components/ui/context-menu";
import { Image } from "~/components/ui/image";
import { getCacheControl } from "~/lib/utils";
import { getTopLeaderboard } from "~/services/prisma/tracks.server";
import type { Route } from "./+types/home";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": getCacheControl({ browser: "half-hour", cdn: "hour" }),
  };
}

export function loader({ context }: Route.LoaderArgs) {
  return { leaderboard: getTopLeaderboard() };
}

export default function Home({
  loaderData: { leaderboard },
}: Route.ComponentProps) {
  return (
    <main className="relative isolate flex flex-1 flex-col items-center gap-y-10 py-10">
      <RootMenu />

      <Logo />
      <ul className="flex w-full max-w-md flex-col gap-y-2">
        <Suspense fallback={<Waver />}>
          <Leaderboard leaderboard={leaderboard} />
        </Suspense>
      </ul>
    </main>
  );
}

const VARIATIONS = {
  "1": "/logo/musy-1.png",
} as const;

function Logo() {
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
        <Link to="/account">
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

function Leaderboard(props: {
  leaderboard: ReturnType<typeof getTopLeaderboard>;
}) {
  const leaderboard = use(props.leaderboard);

  return leaderboard.map((track, index) => {
    return (
      <li key={track.id} className="flex items-center gap-x-2">
        <span className="basis-6 font-bold">{index + 1}.</span>
        <Track
          id={track.id}
          uri={track.uri}
          image={track.image}
          artist={track.artist}
          name={track.name}
        />
      </li>
    );
  });
}
