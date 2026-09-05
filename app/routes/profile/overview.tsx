import { CalendarDays, Clock, Heart, Play, RefreshCcw } from "lucide-react";
import { Suspense, use, useEffect, useRef, useState } from "react";
import { Link, redirect, useNavigation, useRevalidator } from "react-router";
import {
  ImportEmptyState,
  useInitialImport,
} from "~/components/domain/initial-import";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { getDashboard } from "~/lib.server/services/dashboard";
import { Selector } from "~/routes/profile/utils/profile.utils";
import type { Route } from "./+types/overview";

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
    stats: getDashboard(userId, year),
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
  const importing =
    initialImport?.status === "queued" || initialImport?.status === "running";

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
          <Suspense fallback={<Selector year={year} />}>
            <YearSelector year={year} stats={stats} />
          </Suspense>
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
      <Suspense fallback={<Waver />}>
        <Stats stats={stats} year={year} importing={importing} />
      </Suspense>
    </div>
  );
}

function YearSelector({
  year,
  stats,
}: {
  year: number;
  stats: ReturnType<typeof getDashboard>;
}) {
  return <Selector year={year} years={use(stats).availableYears} />;
}

function Stats({
  stats: promise,
  year,
  importing,
}: {
  stats: ReturnType<typeof getDashboard>;
  year: number;
  importing: boolean;
}) {
  const stats = use(promise);
  const [unit, setUnit] = useState<"minutes" | "hours">("minutes");
  const [metric, setMetric] = useState<"plays" | "minutes">("plays");
  const peakMonth = stats.monthly.reduce<(typeof stats.monthly)[number] | null>(
    (best, row) => (!best || row[metric] > best[metric] ? row : best),
    null,
  );

  const peakWeekday = stats.weekdays.reduce((best, row) =>
    row.plays > best.plays ? row : best,
  );
  const [offsetHours, setOffsetHours] = useState<number | null>(null);
  useEffect(() => {
    setOffsetHours(Math.round(-new Date().getTimezoneOffset() / 60));
  }, []);
  const hourly = stats.hourly.map((row, hour) => ({
    ...row,
    plays: stats.hourly[(hour - (offsetHours ?? 0) + 48) % 24].plays,
  }));
  const peakHour = hourly.reduce((best, row) =>
    row.plays > best.plays ? row : best,
  );
  const weekendShare = stats.played
    ? (stats.weekdays.slice(5).reduce((sum, row) => sum + row.plays, 0) /
        stats.played) *
      100
    : 0;
  const periodDays = (() => {
    const first = stats.monthly[0]?.key;
    if (!first) return 0;
    const start = Date.parse(`${first}-01T00:00:00Z`);
    const today = Date.now();
    const end =
      year && year < new Date().getUTCFullYear()
        ? Date.UTC(year, 11, 31)
        : today;
    return Math.max(
      stats.activeDays,
      Math.floor((end - start) / 86_400_000) + 1,
    );
  })();

  return (
    <>
      {stats.pending && stats.played > 0 && (
        <output className="text-muted-foreground text-xs">
          Updating stats…
        </output>
      )}
      {!stats.played ? (
        <ImportEmptyState>
          {importing || stats.pending
            ? "Preparing your stats…"
            : "No listening history for this period."}
        </ImportEmptyState>
      ) : null}
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          icon={Play}
          label="Plays"
          value={number(stats.played)}
          detail={`${number(stats.uniqueTracks)} different tracks`}
          backdrop={
            <Sparkline values={stats.monthly.map((row) => row.plays)} />
          }
        />
        <Metric
          icon={Clock}
          label="Listening time"
          value={number(
            stats.minutes / (unit === "hours" ? 60 : 1),
            unit === "hours" ? 1 : 0,
          )}
          unit={unit === "hours" ? "hrs" : "min"}
          detail={
            (unit === "minutes"
              ? `${number(stats.minutes / 60, 1)} hours`
              : `${number(stats.minutes)} minutes`) +
            (stats.estimatedPlays > 0 ? " · estimated" : "") +
            (stats.unknownPlays > 0
              ? ` · ${number(stats.unknownPlays)} unknown duration`
              : "")
          }
          action={
            <fieldset
              aria-label="Listening time unit"
              className="flex rounded-full border border-border bg-background/60 p-0.5 text-[11px]"
            >
              {(["minutes", "hours"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={unit === value}
                  onClick={() => setUnit(value)}
                  className={`rounded-full px-2 py-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    unit === value
                      ? "bg-foreground font-medium text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {value === "minutes" ? "Min" : "Hrs"}
                </button>
              ))}
            </fieldset>
          }
          backdrop={
            <Sparkline values={stats.monthly.map((row) => row.minutes)} />
          }
        />
        <Metric
          icon={CalendarDays}
          label="Active days"
          value={number(stats.activeDays)}
          unit={periodDays ? `of ${number(periodDays)}` : undefined}
          detail={`${number(stats.playsPerActiveDay, 1)} plays / active day`}
          backdrop={
            <Coverage
              share={periodDays ? stats.activeDays / periodDays : 0}
              weekdays={stats.weekdays}
            />
          }
        />
        <Metric
          icon={Heart}
          label="Tracks liked"
          value={number(stats.liked)}
          detail={year ? "Still saved · added this year" : "Currently saved"}
          action={
            <Ring
              share={stats.uniqueTracks ? stats.liked / stats.uniqueTracks : 0}
            />
          }
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
                  {offsetHours === null ? "UTC" : "local"}
                </span>
              </h2>
              <p className="mt-3 font-semibold text-2xl tabular-nums">
                {peakHour.label}
                <span className="ml-2 font-normal text-muted-foreground text-xs">
                  peak hour · {number(peakHour.plays)} plays
                </span>
              </p>
              <BarChart
                rows={hourly.map((row) => ({
                  label: row.label,
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
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  unit,
  detail,
  action,
  backdrop,
}: {
  icon: typeof Play;
  label: string;
  value: string;
  unit?: string;
  detail: string;
  action?: React.ReactNode;
  backdrop?: React.ReactNode;
}) {
  return (
    <div className="group relative isolate min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.05)] transition-[border-color,transform] duration-300 hover:border-foreground/25 sm:p-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-full bg-foreground/[0.05] opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />
      {backdrop && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 text-foreground opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 20%, black 85%, transparent)",
          }}
        >
          {backdrop}
        </div>
      )}
      <div className="relative flex items-center justify-between gap-2">
        <dt className="flex items-center gap-2 text-muted-foreground text-xs">
          <span className="flex size-6 items-center justify-center rounded-md border border-border bg-background/60">
            <Icon className="size-3" aria-hidden="true" />
          </span>
          {label}
        </dt>
        {action}
      </div>
      <dd className="relative mt-4 flex items-baseline gap-1.5 font-semibold text-4xl tabular-nums tracking-tighter sm:text-5xl">
        {value}
        {unit && (
          <span className="font-medium text-muted-foreground text-xs tracking-normal">
            {unit}
          </span>
        )}
      </dd>
      <p className="relative mt-3 text-muted-foreground text-xs">{detail}</p>
    </div>
  );
}
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 100;
  const h = 40;
  const max = Math.max(1, ...values);
  const points = values.map(
    (value, index) =>
      [
        (index / (values.length - 1)) * w,
        h - (value / max) * (h - 4) - 2,
      ] as const,
  );
  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const last = points[points.length - 1];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="size-full"
      aria-hidden="true"
    >
      <polygon
        points={`0,${h} ${line} ${w},${h}`}
        fill="currentColor"
        opacity={0.08}
      />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.6}
      />
      <circle cx={last[0]} cy={last[1]} r={2} fill="currentColor" />
    </svg>
  );
}
function Coverage({
  share,
  weekdays,
}: {
  share: number;
  weekdays: { label: string; plays: number }[];
}) {
  const max = Math.max(1, ...weekdays.map((row) => row.plays));
  return (
    <div className="flex h-full flex-col justify-end gap-2 px-4 pb-4 sm:px-5 sm:pb-5">
      <div className="flex items-end gap-1">
        {weekdays.map((row) => (
          <div
            key={row.label}
            className="flex-1 rounded-t-[2px] bg-current"
            style={{
              height: 4 + (row.plays / max) * 20,
              opacity: 0.15 + (row.plays / max) * 0.45,
            }}
          />
        ))}
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-current/15">
        <div
          className="h-full rounded-full bg-current transition-[width] duration-700"
          style={{ width: `${Math.min(100, share * 100)}%` }}
        />
      </div>
    </div>
  );
}
function Ring({ share }: { share: number }) {
  const r = 10;
  const c = 2 * Math.PI * r;
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6 shrink-0 text-foreground"
      aria-label={`${number(share * 100, 1)}% of tracks liked`}
      role="img"
    >
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.15"
      />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.min(1, share))}
        transform="rotate(-90 12 12)"
        className="transition-[stroke-dashoffset] duration-700"
      />
    </svg>
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
  const chartRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(chart);
    return () => observer.disconnect();
  }, []);
  const max = Math.max(1, ...rows.map((row) => row.value));
  const labelWidth = Math.max(
    36,
    ...rows.map((row) => (row.shortLabel ?? row.label).length * 6 + 16),
  );
  const tickCount = Math.min(
    rows.length,
    Math.max(1, Math.floor(width / labelWidth)),
  );
  const ticks = Array.from({ length: tickCount }, (_, index) =>
    tickCount === 1
      ? 0
      : Math.round((index * (rows.length - 1)) / (tickCount - 1)),
  );
  return (
    <>
      <div ref={chartRef} className="mt-5">
        <div
          className="flex h-36 items-end border-border border-b"
          style={{ gap: rows.length > 24 ? 1 : 4 }}
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
          className="relative mt-2 h-4 text-[10px] text-muted-foreground"
          aria-hidden="true"
        >
          {ticks.map((index, tick) => (
            <span
              key={rows[index].label}
              className="absolute whitespace-nowrap"
              style={{
                left:
                  tick === 0
                    ? 0
                    : tick === ticks.length - 1
                      ? "100%"
                      : `${((index + 0.5) / rows.length) * 100}%`,
                transform:
                  tick === 0
                    ? undefined
                    : tick === ticks.length - 1
                      ? "translateX(-100%)"
                      : "translateX(-50%)",
              }}
            >
              {rows[index].shortLabel ?? rows[index].label}
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
