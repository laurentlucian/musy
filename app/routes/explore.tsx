import { Globe2, MapPin, Monitor } from "lucide-react";
import { Suspense, use } from "react";
import { data, Link, redirect, useSearchParams } from "react-router";
import ListeningMap from "~/components/domain/listening-map";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { normalizeCountry } from "~/lib/countries";
import { listeningTime } from "~/lib/device";
import {
  getHistoryInsights,
  getLocationSongs,
} from "~/lib.server/services/history-insights";
import type { Route } from "./+types/explore";

const headers = { "Cache-Control": "private, no-store" };

export async function loader({ context, request }: Route.LoaderArgs) {
  const userId = context.get(userContext);
  if (!userId) throw redirect("/", { headers });
  const params = new URL(request.url).searchParams;
  const country = normalizeCountry(params.get("country"));
  if (params.has("country") && !country)
    throw data("Invalid country", { status: 400, headers });
  const rawPage = Number(params.get("page") ?? 0);
  if (!Number.isSafeInteger(rawPage) || rawPage < 0 || rawPage > 1_000_000)
    throw data("Invalid page", { status: 400, headers });
  const history = Promise.all([
    getHistoryInsights(userId),
    getLocationSongs(userId, rawPage, country),
  ]).then(([insights, result]) => ({ ...insights, ...result }));
  return data(
    {
      history,
      page: rawPage,
      country,
    },
    { headers },
  );
}

export default function Explore({ loaderData }: Route.ComponentProps) {
  return (
    <main className="space-y-8 py-4">
      <header className="flex flex-wrap items-end justify-between gap-4 border-border border-b pb-4">
        <div>
          <h1 className="font-semibold text-2xl">Explore</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Private · Imported Spotify history
          </p>
        </div>
        <Suspense fallback={<Waver />}>
          <ExploreSummary history={loaderData.history} />
        </Suspense>
      </header>
      <Suspense fallback={<Waver />}>
        <ExploreContent loaderData={loaderData} />
      </Suspense>
    </main>
  );
}

function ExploreSummary({
  history,
}: Pick<Route.ComponentProps["loaderData"], "history">) {
  const { listens, msPlayed } = use(history);
  return (
    <div className="flex gap-6 text-sm">
      <div>
        <p className="font-semibold text-xl tabular-nums">
          {listens.toLocaleString()}
        </p>
        <p className="text-muted-foreground">Listens</p>
      </div>
      <div>
        <p className="font-semibold text-xl tabular-nums">
          {listeningTime(msPlayed)}
        </p>
        <p className="text-muted-foreground">Listening time</p>
      </div>
    </div>
  );
}

function ExploreContent({
  loaderData,
}: Pick<Route.ComponentProps, "loaderData">) {
  const { devices, countries, listens, msPlayed, located, songs, total } = use(
    loaderData.history,
  );
  const { page, country } = loaderData;
  const [, setParams] = useSearchParams();
  const label = country
    ? countries.find((item) => item.code === country)?.label || country
    : "All listening";
  return (
    <>
      {!listens ? (
        <div className="py-16 text-center">
          <Globe2 className="mx-auto mb-4 size-8 text-muted-foreground" />
          <h2 className="font-semibold text-xl">Your listening, mapped</h2>
          <p className="mt-2 mb-5 text-muted-foreground text-sm">
            Import your Spotify history to begin.
          </p>
          <Button asChild>
            <Link to="/settings">Import history</Link>
          </Button>
        </div>
      ) : (
        <>
          <section className="space-y-3" aria-label="Listening map">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-lg">
                <MapPin className="size-4" />
                Places
              </h2>
              <p className="text-muted-foreground text-sm">
                {located.toLocaleString()} of {listens.toLocaleString()} listens
                located
              </p>
            </div>
            <ListeningMap
              countries={countries}
              selected={country}
              onSelect={(code) => setParams({ country: code })}
            />
            {countries.length > 0 && (
              <section className="flex flex-wrap gap-2" aria-label="Countries">
                {countries.map((item) => (
                  <Button
                    key={item.code}
                    variant={country === item.code ? "default" : "outline"}
                    size="sm"
                    aria-pressed={country === item.code}
                    onClick={() => setParams({ country: item.code })}
                  >
                    {item.label}
                    <span className="tabular-nums">
                      {item.listens.toLocaleString()}
                    </span>
                  </Button>
                ))}
              </section>
            )}
            <p className="text-muted-foreground text-xs">
              Countries from your Spotify export. Select one to explore songs.
            </p>
          </section>
          <section className="space-y-4" aria-label="Device statistics">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-lg">
                <Monitor className="size-4" />
                Devices
              </h2>
              <p className="text-muted-foreground text-xs">
                Models identified when present in your export.
              </p>
            </div>
            <div className="grid gap-x-8 md:grid-cols-2">
              {devices.map((device) => (
                <div key={device.label} className="border-border border-b py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="font-medium text-sm">{device.label}</span>
                    <span className="whitespace-nowrap text-muted-foreground text-xs tabular-nums">
                      {device.listens.toLocaleString()} listens ·{" "}
                      {listeningTime(device.msPlayed)}
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${msPlayed ? (device.msPlayed / msPlayed) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section
            className="space-y-3"
            aria-label="Songs at selected location"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">{label}</h2>
                <p className="text-muted-foreground text-sm">
                  {total.toLocaleString()} listens
                </p>
              </div>
              {country && (
                <Button variant="ghost" onClick={() => setParams({})}>
                  Show all
                </Button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-border border-b text-muted-foreground text-xs">
                  <tr>
                    <th className="py-3 font-normal">Song</th>
                    <th className="px-3 font-normal">Device</th>
                    <th className="whitespace-nowrap px-3 font-normal">
                      Played · UTC
                    </th>
                    <th className="text-right font-normal">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song) => (
                    <tr key={song.id} className="border-border/50 border-b">
                      <td className="min-w-40 py-3">
                        <Link
                          to={`/track/${song.trackId}`}
                          className="font-medium hover:underline"
                        >
                          {song.trackName}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {song.artistName}
                        </p>
                      </td>
                      <td className="px-3 text-muted-foreground text-xs">
                        {song.device}
                      </td>
                      <td className="whitespace-nowrap px-3 text-muted-foreground text-xs tabular-nums">
                        {song.playedAt.replace("T", " ").slice(0, 16)}
                      </td>
                      <td className="whitespace-nowrap text-right text-xs tabular-nums">
                        {Math.floor(song.msPlayed / 60_000)}:
                        {String(Math.floor(song.msPlayed / 1000) % 60).padStart(
                          2,
                          "0",
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!songs.length && (
              <p className="py-6 text-muted-foreground text-sm">
                No listens here.
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">
                {total
                  ? `${(page * 50 + 1).toLocaleString()}–${Math.min(total, (page + 1) * 50).toLocaleString()} of ${total.toLocaleString()}`
                  : "0 listens"}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!page}
                  onClick={() =>
                    setParams(
                      (current) => {
                        current.set("page", String(page - 1));
                        return current;
                      },
                      { preventScrollReset: true },
                    )
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(page + 1) * 50 >= total}
                  onClick={() =>
                    setParams(
                      (current) => {
                        current.set("page", String(page + 1));
                        return current;
                      },
                      { preventScrollReset: true },
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
