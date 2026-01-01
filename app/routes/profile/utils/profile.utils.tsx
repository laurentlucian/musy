import { RefreshCcw } from "lucide-react";
import { use } from "react";
import { useFetcher, useNavigation, useSearchParams } from "react-router";
import { Artist } from "~/components/domain/artist";
import { NavLinkSub } from "~/components/domain/nav";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { getTopData } from "~/routes/profile/utils/profile.server";

export function Selector({ year }: { year: number | null }) {
  const [params, setParams] = useSearchParams();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <Select
      value={year?.toString() ?? "all"}
      onValueChange={(data) => {
        const newParams = { ...Object.fromEntries(params) };
        if (data && data !== "all") {
          newParams.year = data;
        } else {
          delete newParams.year;
        }
        setParams(newParams, {
          preventScrollReset: true,
        });
      }}
    >
      <SelectTrigger className="min-w-[100px]">
        <SelectValue>
          {year?.toString() ?? "All"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {years.map((y) => (
          <SelectItem key={y} value={y.toString()}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Loader() {
  const navigation = useNavigation();

  return <div>{navigation.state === "loading" && <Waver />}</div>;
}

export function SyncButton({ userId }: { userId: string }) {
  const fetcher = useFetcher();
  const isSyncing =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="ml-auto"
      disabled={isSyncing}
      onClick={() => {
        fetcher.submit({ intent: "sync", userId }, { method: "post" });
      }}
    >
      {isSyncing ? <Waver /> : <RefreshCcw />}
    </Button>
  );
}

export function Links() {
  return (
    <nav className="flex w-full gap-2 overflow-x-auto overflow-y-hidden scroll-smooth p-1">
      <NavLinkSub to=".">Stats</NavLinkSub>
      <NavLinkSub to="top">Top</NavLinkSub>
      <NavLinkSub to="liked">Liked</NavLinkSub>
      <NavLinkSub to="recent">Listened</NavLinkSub>
      <NavLinkSub to="playlists">Playlists</NavLinkSub>
    </nav>
  );
}

const rangeLabels: Record<string, string> = {
  long_term: "Year",
  medium_term: "Half Year",
  short_term: "Month",
};

const typeLabels: Record<string, string> = {
  tracks: "Tracks",
  artists: "Artists",
};

export function TopSelector({ type, range }: { type: string; range: string }) {
  const [params, setParams] = useSearchParams();

  return (
    <div className="flex items-center gap-2">
      <Select
        value={type}
        onValueChange={(data) => {
          const newParams = { ...Object.fromEntries(params) };
          if (data) {
            newParams.type = data;
          } else {
            delete newParams.type;
          }
          setParams(newParams, {
            preventScrollReset: true,
          });
        }}
      >
        <SelectTrigger className="min-w-[100px]">
          <SelectValue>{typeLabels[type] || type}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tracks">Tracks</SelectItem>
          <SelectItem value="artists">Artists</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={range}
        onValueChange={(data) => {
          const newParams = { ...Object.fromEntries(params) };
          if (data) {
            newParams.range = data;
          } else {
            delete newParams.range;
          }
          setParams(newParams, {
            preventScrollReset: true,
          });
        }}
      >
        <SelectTrigger className="min-w-[100px]">
          <SelectValue>{rangeLabels[range] || range}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="long_term">Year</SelectItem>
          <SelectItem value="medium_term">Half Year</SelectItem>
          <SelectItem value="short_term">Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function TopList({
  promise,
  type,
}: {
  promise: ReturnType<typeof getTopData>;
  type: string;
}) {
  const data = use(promise);
  if (!data) return null;

  if (type === "tracks") {
    const tracks = data.tracks;
    if (!tracks) return null;
    return (
      <div className="flex flex-col gap-2">
        {tracks.map((track) => (
          <Track track={track} key={track.id} />
        ))}
      </div>
    );
  } else {
    const artists = data.artists;
    if (!artists) return null;
    return (
      <div className="flex flex-col gap-2">
        {artists.map((artist) => (
          <Artist artist={artist} key={artist.id} />
        ))}
      </div>
    );
  }
}
