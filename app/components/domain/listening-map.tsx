import "maplibre-gl/dist/maplibre-gl.css";
import type { Marker, Map as VectorMap } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useEffect, useRef, useState } from "react";
import { countryCentroids } from "~/lib/country-centroids";
import type { ListeningCountry } from "~/lib.server/services/history-insights";

export default function ListeningMap({
  countries,
  onSelect,
}: {
  countries: ListeningCountry[];
  onSelect: (code: string) => void;
}) {
  const container = useRef<HTMLElement>(null);
  const select = useRef(onSelect);
  const pins = useRef(countries);
  const redraw = useRef<(() => void) | null>(null);
  pins.current = countries;
  select.current = onSelect;
  const [error, setError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: VectorMap | undefined;
    let observer: ResizeObserver | undefined;
    const markers: Marker[] = [];
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
        let fitted = false;
        const draw = () => {
          for (const marker of markers) marker.remove();
          markers.length = 0;
          const countries = pins.current.filter(
            (item) => countryCentroids[item.code],
          );
          for (const item of countries) {
            const button = document.createElement("button");
            button.type = "button";
            button.className =
              "flex h-11 min-w-11 items-center justify-center rounded-full border-2 border-background bg-primary px-2 text-xs font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
            button.textContent = compact.format(item.listens);
            button.title = `${item.label}: ${item.listens.toLocaleString()} listens`;
            button.setAttribute("aria-label", button.title);
            button.onclick = () => select.current(item.code);
            markers.push(
              new L.Marker({ element: button })
                .setLngLat(countryCentroids[item.code])
                .addTo(view),
            );
          }
          if (!fitted && countries.length) {
            fitted = true;
            const bounds = new L.LngLatBounds();
            for (const item of countries)
              bounds.extend(countryCentroids[item.code]);
            view.fitBounds(bounds, { padding: 55, maxZoom: 5, duration: 0 });
          }
        };
        redraw.current = draw;
        draw();
      })
      .catch(() => {
        if (!disposed) setError(true);
      });
    return () => {
      disposed = true;
      redraw.current = null;
      observer?.disconnect();
      for (const marker of markers) marker.remove();
      map?.remove();
    };
  }, []);

  useEffect(() => {
    redraw.current?.();
  }, [countries]);

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
