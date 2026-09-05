import { ArrowRight, CalendarDays, Check, ListMusic } from "lucide-react";
import { Suspense, use, useState } from "react";
import { Link, useFetcher, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";

export function YearlyPlaylists({
  userId,
  options,
}: {
  userId: string;
  options: Promise<Array<{ year: number; count: number }>>;
}) {
  const [params, setParams] = useSearchParams();
  const open = params.get("tool") === "yearly";
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          setParams(
            (previous) => {
              previous.set("tool", "yearly");
              return previous;
            },
            { preventScrollReset: true },
          )
        }
      >
        <CalendarDays /> Yearly playlists
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value)
            setParams(
              (previous) => {
                previous.delete("tool");
                return previous;
              },
              { preventScrollReset: true },
            );
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogTitle>Make yearly playlists</DialogTitle>
          <DialogDescription>
            Grouped by when you liked each song, not its release date.
          </DialogDescription>
          <Suspense
            fallback={
              <p
                aria-live="polite"
                className="py-8 text-muted-foreground text-sm"
              >
                Loading your years…
              </p>
            }
          >
            <YearPicker userId={userId} options={options} />
          </Suspense>
        </DialogContent>
      </Dialog>
    </>
  );
}

function YearPicker({
  userId,
  options,
}: {
  userId: string;
  options: Promise<Array<{ year: number; count: number }>>;
}) {
  const years = use(options);
  const [selected, setSelected] = useState(() =>
    years.map((item) => item.year),
  );
  const fetcher = useFetcher<{
    success?: boolean;
    error?: string;
    created?: number;
    updated?: number;
  }>();
  const busy = fetcher.state !== "idle";
  const total = years
    .filter((item) => selected.includes(item.year))
    .reduce((sum, item) => sum + item.count, 0);
  if (!years.length)
    return (
      <div className="py-4">
        <ListMusic className="mb-3 size-8 text-muted-foreground" />
        <p className="font-medium text-sm">No liked songs synced yet</p>
        <p className="mt-1 mb-4 text-muted-foreground text-sm">
          Refresh your liked songs to find your years.
        </p>
        <Button asChild variant="outline">
          <Link to={`/profile/${userId}/liked`}>
            Go to liked songs <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  if (!busy && fetcher.data?.success)
    return (
      <div className="py-4" aria-live="polite">
        <Check className="mb-3 size-8" />
        <h3 className="font-semibold">Playlists ready</h3>
        <p className="mt-2 text-muted-foreground text-sm">
          {fetcher.data.created ?? 0} created · {fetcher.data.updated ?? 0}{" "}
          updated
        </p>
        <Button asChild className="mt-5">
          <Link to={`/profile/${userId}/playlists`}>
            View playlists <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  return (
    <fetcher.Form
      method="post"
      action={`/profile/${userId}/playlists`}
      className="space-y-4"
    >
      <input type="hidden" name="intent" value="create-playlists-by-year" />
      <input type="hidden" name="userId" value={userId} />
      <fieldset disabled={busy}>
        <legend className="sr-only">Choose years</legend>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {selected.length} of {years.length} years
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setSelected(
                selected.length === years.length
                  ? []
                  : years.map((item) => item.year),
              )
            }
          >
            {selected.length === years.length ? "Clear" : "Select all"}
          </Button>
        </div>
        <div className="grid max-h-[36dvh] grid-cols-2 gap-2 overflow-y-auto p-1">
          {years.map(({ year, count }) => (
            <label
              key={year}
              className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${selected.includes(year) ? "border-foreground/40 bg-muted" : "border-border hover:bg-muted/50"}`}
            >
              <input
                type="checkbox"
                name="years"
                value={year}
                checked={selected.includes(year)}
                onChange={(event) =>
                  setSelected((previous) =>
                    event.target.checked
                      ? [...previous, year]
                      : previous.filter((value) => value !== year),
                  )
                }
                className="size-4 accent-current"
              />
              <span>
                <span className="block font-medium text-sm">{year}</span>
                <span className="text-muted-foreground text-xs">
                  {count.toLocaleString()} {count === 1 ? "track" : "tracks"}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Creates public Spotify playlists named ’24, ’25, and so on. Matching
        playlists are updated with missing songs.
      </p>
      {fetcher.data?.error && !busy && (
        <p role="alert" className="text-destructive text-sm">
          {fetcher.data.error}
        </p>
      )}
      <div className="border-border border-t pt-4">
        <p className="mb-3 text-muted-foreground text-sm" aria-live="polite">
          {busy
            ? "Building in Spotify. Keep this page open…"
            : `${total.toLocaleString()} tracks across ${selected.length} ${selected.length === 1 ? "playlist" : "playlists"}`}
        </p>
        <Button
          type="submit"
          disabled={busy || !selected.length}
          className="w-full"
        >
          {busy
            ? "Building playlists…"
            : `Build ${selected.length || ""} ${selected.length === 1 ? "playlist" : "playlists"}`}
        </Button>
      </div>
    </fetcher.Form>
  );
}
