import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Link, redirect, useNavigation, useRevalidator } from "react-router";
import {
  ImportEmptyState,
  useInitialImport,
} from "~/components/domain/initial-import";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { getDashboard } from "~/lib.server/services/dashboard";
import { Selector } from "~/routes/profile/utils/profile.utils";
import type { Route } from "./+types/profile.stats";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const userId = params.userId ?? context.get(userContext);
  if (!userId) throw redirect("/");
  const yearParam = new URL(request.url).searchParams.get("year");
  const currentYear = new Date().getUTCFullYear();
  const year =
    yearParam === "all"
      ? 0
      : yearParam === null
        ? currentYear
        : Number(yearParam);
  if (
    !Number.isInteger(year) ||
    (year !== 0 && (year < 1900 || year > currentYear))
  ) {
    throw new Response("Invalid year", { status: 400 });
  }
  return {
    userId,
    currentUserId: context.get(userContext),
    year,
    stats: await getDashboard(userId, year),
  };
}

const number = (value: number, digits = 0) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
const panel = "min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5";
const dateLabel = (key: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${key}T00:00:00Z`));

export default function ProfileIndex({
  loaderData: { stats, year, userId, currentUserId },
}: Pick<Route.ComponentProps, "loaderData">) {
  const importState = useInitialImport();
  const initialImport = userId === currentUserId ? importState : null;
  const revalidator = useRevalidator();
  const navigation = useNavigation();
  const busy = revalidator.state !== "idle" || navigation.state !== "idle";
  const [unit, setUnit] = useState<"minutes" | "hours">("minutes");
  const [metric, setMetric] = useState<"plays" | "minutes">("plays");
  const importing =
    initialImport?.status === "queued" || initialImport?.status === "running";
  const peakMonth = stats.monthly.reduce<(typeof stats.monthly)[number] | null>(
    (best, row) => (!best || row[metric] > best[metric] ? row : best),
    null,
  );

  const peakWeekday = stats.weekdays.reduce((best, row) =>
    row.plays > best.plays ? row : best,
  );
  const peakHour = stats.hourly.reduce((best, row) =>
    row.plays > best.plays ? row : best,
  );
  const weekendShare = stats.played
    ? (stats.weekdays.slice(5).reduce((sum, row) => sum + row.plays, 0) /
        stats.played) *
      100
    : 0;

  return (
    <div className="flex min-w-0 flex-col gap-4 pb-4" aria-busy={busy}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-semibold text-xl">Overview</h1>
          <p className="text-muted-foreground text-xs">
            {year || "All-time"} listening
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Selector year={year} years={stats.availableYears} />
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Refresh stats"
            disabled={busy}
            onClick={() => void revalidator.revalidate()}
          >
            <RefreshCcw
              className={busy ? "motion-safe:animate-spin" : undefined}
            />
          </Button>
        </div>
      </div>
      {importing && (
        <output className="text-muted-foreground text-xs">
          Importing history. Stats update as it arrives.
        </output>
      )}
      {!stats.played ? (
        <ImportEmptyState>
          {importing
            ? "Preparing your stats…"
            : "No listening history for this period."}
        </ImportEmptyState>
      ) : null}
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          label="Plays"
          value={number(stats.played)}
          detail={`${number(stats.uniqueTracks)} different tracks`}
          prominent
        />
        <div className={panel}>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground text-xs">Listening time</dt>
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Show listening time in ${unit === "minutes" ? "hours" : "minutes"}`}
              onClick={() => setUnit(unit === "minutes" ? "hours" : "minutes")}
            >
              {unit === "minutes" ? "Min" : "Hrs"}
            </Button>
          </div>
          <dd className="mt-2 font-semibold text-3xl tabular-nums tracking-tight sm:text-4xl">
            {number(
              stats.minutes / (unit === "hours" ? 60 : 1),
              unit === "hours" ? 1 : 0,
            )}
          </dd>
          <p className="mt-2 text-muted-foreground text-xs">
            {unit === "minutes"
              ? `${number(stats.minutes / 60, 1)} hours`
              : `${number(stats.minutes)} minutes`}
            {stats.estimatedPlays > 0 ? " · estimated" : ""}
          </p>
        </div>
        <Metric
          label="Active days"
          value={number(stats.activeDays)}
          detail={`${number(stats.playsPerActiveDay, 1)} plays / active day`}
          prominent
        />
        <Metric
          label="Tracks liked"
          value={number(stats.liked)}
          detail={year ? "Still saved · added this year" : "Currently saved"}
          prominent
        />
      </dl>
      {stats.played > 0 && (
        <>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
            <section className={panel} aria-label="Listening over time">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-sm">Listening over time</h2>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {peakMonth
                      ? `Peak: ${monthLabel(peakMonth.key)} · ${number(peakMonth[metric])} ${metric}`
                      : "Monthly totals"}
                  </p>
                </div>
                <div className="flex gap-1">
                  {(["plays", "minutes"] as const).map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={metric === value ? "secondary" : "ghost"}
                      aria-pressed={metric === value}
                      onClick={() => setMetric(value)}
                    >
                      {value === "plays" ? "Plays" : "Minutes"}
                    </Button>
                  ))}
                </div>
              </div>
              <BarChart
                rows={stats.monthly.map((row) => ({
                  label: monthLabel(row.key),
                  shortLabel: year
                    ? monthLabel(row.key).split(" ")[0]
                    : monthLabel(row.key),
                  value: row[metric],
                }))}
                unit={metric}
              />
            </section>
            <section className={panel}>
              <h2 className="font-semibold text-sm">Listening habits</h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
                <SmallMetric
                  label="Longest streak"
                  value={`${number(stats.longestStreak)}d`}
                />
                <SmallMetric
                  label="Min / active day"
                  value={number(stats.minutesPerActiveDay, 1)}
                />
                <SmallMetric
                  label="Min / play"
                  value={number(stats.averageMinutes, 1)}
                />
                <SmallMetric
                  label="Plays / track"
                  value={number(stats.played / stats.uniqueTracks, 1)}
                />
              </dl>
              <div className="mt-5 border-border border-t pt-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-muted-foreground text-xs">
                    Repeat plays
                  </h3>
                  <p className="font-semibold text-2xl tabular-nums">
                    {number(stats.repeatShare, 1)}
                    <span className="text-muted-foreground text-sm">%</span>
                  </p>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-foreground"
                    style={{ width: `${stats.repeatShare}%` }}
                  />
                </div>
                <p className="mt-2 text-muted-foreground text-xs">
                  Plays beyond each track’s first in this period.
                </p>
              </div>
            </section>
          </div>
          <div className="grid gap-3 xl:grid-cols-3">
            <Ranking
              title="Top tracks"
              items={stats.topTracks}
              kind="track"
              total={stats.played}
              distinct={stats.uniqueTracks}
            />
            <Ranking
              title="Top artists"
              items={stats.topArtists}
              kind="artist"
              total={stats.played}
              distinct={stats.uniqueArtists}
            />
            <Ranking
              title="Top albums"
              items={stats.topAlbums}
              kind="album"
              total={stats.played}
              distinct={stats.uniqueAlbums}
            />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <section className={panel}>
              <h2 className="font-semibold text-sm">Days of the week</h2>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <p className="font-semibold text-2xl">
                  {peakWeekday.label}
                  <span className="ml-2 font-normal text-muted-foreground text-xs">
                    {number(peakWeekday.plays)} plays
                  </span>
                </p>
                <p className="text-muted-foreground text-xs">
                  {number(weekendShare, 1)}% weekends
                </p>
              </div>
              <BarChart
                rows={stats.weekdays.map((row) => ({
                  label: row.label,
                  value: row.plays,
                }))}
                unit="plays"
              />
            </section>
            <section className={panel}>
              <h2 className="font-semibold text-sm">
                Time of day{" "}
                <span className="font-normal text-muted-foreground text-xs">
                  UTC
                </span>
              </h2>
              <p className="mt-3 font-semibold text-2xl tabular-nums">
                {peakHour.label}
                <span className="ml-2 font-normal text-muted-foreground text-xs">
                  peak hour · {number(peakHour.plays)} plays
                </span>
              </p>
              <BarChart
                rows={stats.hourly.map((row, index) => ({
                  label: row.label,
                  shortLabel: index % 6 === 0 ? row.label : "",
                  value: row.plays,
                }))}
                unit="plays"
              />
            </section>
          </div>
          {stats.peakDay && (
            <p className="text-muted-foreground text-xs">
              Busiest day:{" "}
              <span className="text-foreground">
                {dateLabel(stats.peakDay.key)}
              </span>{" "}
              · {number(stats.peakDay.plays)} plays ·{" "}
              {number(stats.peakDay.minutes)} minutes
            </p>
          )}
        </>
      )}
      <details className="text-muted-foreground text-xs">
        <summary className="w-fit cursor-pointer rounded-sm py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          About these numbers
        </summary>
        <p className="mt-2 max-w-3xl leading-relaxed">
          Based on recorded listening history, including imports. Dates and
          streaks use UTC. Plays include recorded starts, even zero-duration
          plays.{" "}
          {stats.estimatedPlays > 0 &&
            `${number(stats.estimatedPlays)} plays use track duration because actual listening time is unavailable. `}
          Repeat plays are measured within the selected period. Collaborating
          artists each receive a play. Saved tracks reflect your current
          library.
        </p>
      </details>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  prominent,
}: {
  label: string;
  value: string;
  detail: string;
  prominent?: boolean;
}) {
  return (
    <div className={panel}>
      <dt className="flex min-h-8 items-center text-muted-foreground text-xs">
        {label}
      </dt>
      <dd
        className={`mt-2 font-semibold tabular-nums tracking-tight ${prominent ? "text-3xl sm:text-4xl" : "text-2xl"}`}
      >
        {value}
      </dd>
      <p className="mt-2 text-muted-foreground text-xs">{detail}</p>
    </div>
  );
}
function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 font-semibold text-2xl tabular-nums tracking-tight">
        {value}
      </dd>
    </div>
  );
}
function monthLabel(key: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${key}-01T00:00:00Z`));
}
function BarChart({
  rows,
  unit,
}: {
  rows: { label: string; shortLabel?: string; value: number }[];
  unit: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <>
      <div className="mt-5 overflow-x-auto">
        <div
          className="flex h-36 items-end gap-1 border-border border-b"
          style={{ minWidth: rows.length > 24 ? rows.length * 22 : undefined }}
          aria-hidden="true"
        >
          {rows.map((row) => (
            <div
              key={row.label}
              className="group relative flex h-full min-w-0 flex-1 items-end"
              title={`${row.label}: ${number(row.value)} ${unit}`}
            >
              <div
                className="w-full rounded-t-sm bg-foreground/60 transition-colors group-hover:bg-foreground"
                style={{
                  height: `${(row.value / max) * 100}%`,
                  minHeight: row.value > 0 ? 2 : 0,
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="mt-2 flex gap-1"
          style={{ minWidth: rows.length > 24 ? rows.length * 22 : undefined }}
          aria-hidden="true"
        >
          {rows.map((row) => (
            <span
              key={row.label}
              className="min-w-0 flex-1 truncate text-center text-[10px] text-muted-foreground"
            >
              {row.shortLabel ?? row.label}
            </span>
          ))}
        </div>
      </div>
      <details className="mt-3 text-muted-foreground text-xs">
        <summary className="w-fit cursor-pointer rounded-sm py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          View numbers
        </summary>
        <div className="mt-2 max-h-48 overflow-auto">
          <table className="w-full text-left">
            <caption className="sr-only">{unit} by period</caption>
            <thead>
              <tr>
                <th scope="col" className="py-1 font-medium">
                  Period
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  {unit === "plays" ? "Plays" : "Minutes"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-border border-t">
                  <th scope="row" className="py-1 font-normal">
                    {row.label}
                  </th>
                  <td className="py-1 text-right text-foreground tabular-nums">
                    {number(row.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
function Ranking({
  title,
  items,
  kind,
  total,
  distinct,
}: {
  title: string;
  items: { id: string | null; name: string; plays: number }[];
  kind: "track" | "artist" | "album";
  total: number;
  distinct: number;
}) {
  return (
    <section className={panel}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-semibold text-sm">{title}</h2>
        <span className="text-muted-foreground text-xs">
          {number(distinct)} total
        </span>
      </div>
      {items.length ? (
        <ol className="mt-4 space-y-4">
          {items.map((item, index) => (
            <li
              key={`${item.id}-${item.name}-${index}`}
              className="flex items-center gap-3"
            >
              <span className="w-3 shrink-0 text-muted-foreground text-xs tabular-nums">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  {item.id ? (
                    <Link
                      to={`/${kind}/${item.id}`}
                      viewTransition
                      className="truncate rounded-sm text-sm hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      title={item.name}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span className="truncate text-sm" title={item.name}>
                      {item.name}
                    </span>
                  )}
                  <span className="shrink-0 text-sm tabular-nums">
                    {number(item.plays)}
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      plays
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div
                    className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-foreground/50"
                      style={{
                        width: `${Math.min(100, (item.plays / total) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-[10px] text-muted-foreground tabular-nums">
                    {number((item.plays / total) * 100, 1)}%
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-muted-foreground text-xs">
          No {kind} metadata.
        </p>
      )}
    </section>
  );
}
