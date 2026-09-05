import { RefreshCcw } from "lucide-react";
import { use, useEffect } from "react";
import { useFetcher, useNavigation, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Artist } from "~/components/domain/artist";
import { ImportEmptyState } from "~/components/domain/initial-import";
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

export function Selector({ year, className }: { year: number | null; className?: string }) {
  const [params, setParams] = useSearchParams();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const isAll = year === null || year === 0;

  return (
    <Select
      value={isAll ? "all" : year.toString()}
      onValueChange={(data) => {
        const newParams = { ...Object.fromEntries(params) };
        if (data === "all") {
          newParams.year = "all";
        } else if (data) {
          newParams.year = data;
        } else {
          delete newParams.year;
        }
        setParams(newParams, {
          preventScrollReset: true,
        });
      }}
    >
      <SelectTrigger aria-label="Year" className={className ?? "min-w-[100px]"}>
        <SelectValue>{isAll ? "All time" : year.toString()}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All time</SelectItem>
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

export function SyncButton({
  userId,
  compact = false,
}: {
  userId: string;
  compact?: boolean;
}) {
  const fetcher = useFetcher();
  const isSyncing =
    fetcher.state === "submitting" || fetcher.state === "loading";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) toast.success("Music refreshed");
      else if (fetcher.data.error) toast.error(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <Button
      type="button"
      size={compact ? "icon" : "sm"}
      variant={compact ? "ghost" : "outline"}
      className="ml-auto shrink-0"
      aria-label="Refresh your music"
      disabled={isSyncing}
      onClick={() => {
        fetcher.submit(
          { intent: "sync", userId },
          { method: "post", action: "/profile" },
        );
      }}
    >
      {isSyncing ? <Waver /> : <RefreshCcw />}
      {!compact && (isSyncing ? "Refreshing…" : "Refresh")}
    </Button>
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
    <div className="flex flex-wrap items-center gap-2">
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
        <SelectTrigger aria-label="Ranking filter" className="min-w-[100px]">
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
        <SelectTrigger aria-label="Ranking filter" className="min-w-[100px]">
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
  if (!data)
    return (
      <ImportEmptyState>
        No favorites yet. Refresh to bring in your music.
      </ImportEmptyState>
    );

  if (type === "tracks") {
    const tracks = data.tracks;
    if (!tracks?.length)
      return (
        <ImportEmptyState>
          No top tracks yet. Refresh to bring in your favorites.
        </ImportEmptyState>
      );
    return (
      <div className="flex flex-col gap-2">
        {tracks.map((track) => (
          <Track track={track} key={track.id} />
        ))}
      </div>
    );
  } else {
    const artists = data.artists;
    if (!artists?.length)
      return (
        <ImportEmptyState>
          No top artists yet. Refresh to bring in your favorites.
        </ImportEmptyState>
      );
    return (
      <div className="flex flex-col gap-2">
        {artists.map((artist) => (
          <Artist artist={artist} key={artist.id} />
        ))}
      </div>
    );
  }
}
