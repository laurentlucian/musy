import "maplibre-gl/dist/maplibre-gl.css";
import type {
  LngLatBounds,
  Marker,
  Popup,
  Map as VectorMap,
} from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useEffect, useRef, useState } from "react";
import { countryCentroids } from "~/lib/country-centroids";
import { listeningTime } from "~/lib/device";
import type { ListeningCountry } from "~/lib.server/services/history-insights";

type Feature = {
  properties: { code: string };
  geometry: { type: string; coordinates: unknown };
};

export default function ListeningMap({
  countries,
  selected,
  onSelect,
}: {
  countries: ListeningCountry[];
  selected: string | null;
  onSelect: (code: string) => void;
}) {
  const container = useRef<HTMLElement>(null);
  const select = useRef(onSelect);
  const pins = useRef(countries);
  const redraw = useRef<(() => void) | null>(null);
  const focus = useRef<((code: string | null) => void) | null>(null);
  pins.current = countries;
  select.current = onSelect;
  const [error, setError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: VectorMap | undefined;
    let observer: ResizeObserver | undefined;
    const markers: Marker[] = [];
    let popup: Popup | undefined;
    void import("maplibre-gl")
      .then((L) => {
        if (disposed || !container.current) return;
        L.setWorkerUrl(workerUrl);
        const view = new L.Map({
          container: container.current,
          style: "https://tiles.openfreemap.org/styles/dark",
          center: [0, 25],
          zoom: 1.5,
          minZoom: 1,
          maxZoom: 18,
          cooperativeGestures: true,
          renderWorldCopies: false,
        });
        map = view;
        view.addControl(new L.NavigationControl(), "top-right");
        view.addControl(new L.FullscreenControl(), "top-right");
        view.addControl(new L.ScaleControl());
        view.on("error", () => {
          if (!disposed) setError(true);
        });
        view.on("idle", () => {
          if (!disposed && view.areTilesLoaded()) setError(false);
        });
        observer = new ResizeObserver(() => view.resize());
        observer.observe(container.current);
        const compact = new Intl.NumberFormat("en", {
          notation: "compact",
          maximumFractionDigits: 1,
        });
        const shapes = new Map<string, LngLatBounds>();
        const styled = new Promise<void>((resolve) => {
          if (view.isStyleLoaded()) resolve();
          else view.once("load", () => resolve());
        });
        const loaded = Promise.all([
          fetch("/countries.geojson").then(
            (res) => res.json() as Promise<{ features: Feature[] }>,
          ),
          styled,
        ]).then(([geo]) => {
          if (disposed) return;
          for (const feature of geo.features) {
            const bounds = new L.LngLatBounds();
            const walk = (coords: unknown) => {
              if (typeof (coords as number[])[0] === "number")
                bounds.extend(coords as [number, number]);
              else for (const child of coords as unknown[]) walk(child);
            };
            walk(feature.geometry.coordinates);
            shapes.set(feature.properties.code, bounds);
          }
          view.addSource("countries", { type: "geojson", data: geo as never });
          const before = view
            .getStyle()
            .layers.find((layer) => layer.type === "symbol")?.id;
          view.addLayer(
            {
              id: "country-fill",
              type: "fill",
              source: "countries",
              filter: ["==", ["get", "code"], ""],
              paint: { "fill-color": "#fcfcfc", "fill-opacity": 0.28 },
            },
            before,
          );
          view.addLayer(
            {
              id: "country-line",
              type: "line",
              source: "countries",
              filter: ["==", ["get", "code"], ""],
              paint: { "line-color": "#fcfcfc", "line-width": 2 },
            },
            before,
          );
        });
        let fitted = false;
        const fitAll = (duration: number) => {
          const countries = pins.current.filter(
            (item) => countryCentroids[item.code],
          );
          if (!countries.length) return;
          const bounds = new L.LngLatBounds();
          for (const item of countries)
            bounds.extend(countryCentroids[item.code]);
          view.fitBounds(bounds, { padding: 55, maxZoom: 5, duration });
        };
        const draw = () => {
          for (const marker of markers) marker.remove();
          markers.length = 0;
          for (const item of pins.current) {
            const at = countryCentroids[item.code];
            if (!at) continue;
            const button = document.createElement("button");
            button.type = "button";
            button.className =
              "flex h-11 min-w-11 items-center justify-center rounded-full border-2 border-background bg-primary px-2 text-xs font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
            button.textContent = compact.format(item.listens);
            button.title = `${item.label}: ${item.listens.toLocaleString()} listens`;
            button.setAttribute("aria-label", button.title);
            button.onclick = () => select.current(item.code);
            markers.push(
              new L.Marker({ element: button }).setLngLat(at).addTo(view),
            );
          }
          if (!fitted) {
            fitted = true;
            fitAll(0);
          }
        };
        const show = (code: string | null) => {
          popup?.remove();
          popup = undefined;
          void loaded.then(() => {
            if (disposed) return;
            for (const id of ["country-fill", "country-line"])
              view.setFilter(id, ["==", ["get", "code"], code ?? ""]);
          });
          const item = pins.current.find((entry) => entry.code === code);
          const at = item && countryCentroids[item.code];
          if (!item || !at) {
            fitAll(900);
            return;
          }
          const total = pins.current.reduce(
            (sum, entry) => sum + entry.listens,
            0,
          );
          const share = total ? (item.listens / total) * 100 : 0;
          const rank =
            pins.current.filter((entry) => entry.listens > item.listens)
              .length + 1;
          const content = document.createElement("div");
          content.className = "space-y-2 text-popover-foreground";
          content.innerHTML = `
            <p class="pr-5 font-semibold text-base">${item.label}</p>
            <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt class="text-muted-foreground">Listens</dt><dd class="tabular-nums">${item.listens.toLocaleString()}</dd>
              <dt class="text-muted-foreground">Time</dt><dd class="tabular-nums">${listeningTime(item.msPlayed)}</dd>
              <dt class="text-muted-foreground">Share</dt><dd class="tabular-nums">${share < 1 ? "<1" : Math.round(share)}%</dd>
              <dt class="text-muted-foreground">Rank</dt><dd class="tabular-nums">#${rank} of ${pins.current.length}</dd>
            </dl>
            <p class="text-muted-foreground text-xs">Songs below</p>`;
          popup = new L.Popup({
            offset: 28,
            closeOnClick: false,
            className: "listening-popup",
            maxWidth: "260px",
          })
            .setLngLat(at)
            .setDOMContent(content)
            .addTo(view);
          void loaded.then(() => {
            if (disposed) return;
            const bounds = shapes.get(item.code);
            if (bounds)
              view.fitBounds(bounds, {
                padding: 80,
                maxZoom: 6,
                duration: 900,
              });
            else view.flyTo({ center: at, zoom: 5, duration: 900 });
          });
        };
        redraw.current = draw;
        focus.current = show;
        draw();
      })
      .catch(() => {
        if (!disposed) setError(true);
      });
    return () => {
      disposed = true;
      redraw.current = null;
      focus.current = null;
      observer?.disconnect();
      popup?.remove();
      for (const marker of markers) marker.remove();
      map?.remove();
    };
  }, []);

  useEffect(() => {
    redraw.current?.();
  }, [countries]);

  useEffect(() => {
    focus.current?.(selected);
  }, [selected]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      <section
        ref={container}
        aria-label="Listening countries. Select a marker to see songs."
        className="isolate h-[62vh] min-h-96 w-full bg-muted"
      />
      {error && (
        <p
          role="alert"
          className="absolute inset-x-4 top-4 z-10 rounded-xl border border-border bg-popover p-3 text-popover-foreground text-sm"
        >
          Map unavailable. Your listening history is below.
        </p>
      )}
    </div>
  );
}
