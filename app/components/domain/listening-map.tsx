import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJSONSource, Marker, Map as VectorMap } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useEffect, useRef, useState } from "react";
import { countryCentroids } from "~/lib/country-centroids";
import type {
  ListeningLocation,
  MapBounds,
} from "~/lib.server/services/history-insights";

export type MapCountry = { code: string; label: string; listens: number };

export default function ListeningMap({
  locations,
  countries,
  onSelect,
  onSelectCountry,
}: {
  locations: ListeningLocation[];
  countries: MapCountry[];
  onSelect: (bounds: MapBounds, label: string) => void;
  onSelectCountry: (code: string) => void;
}) {
  const container = useRef<HTMLElement>(null);
  const select = useRef(onSelect);
  const selectCountry = useRef(onSelectCountry);
  const points = useRef(locations);
  const pins = useRef(countries);
  const redraw = useRef<(() => void) | null>(null);
  points.current = locations;
  pins.current = countries;
  select.current = onSelect;
  selectCountry.current = onSelectCountry;
  const [error, setError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: VectorMap | undefined;
    let observer: ResizeObserver | undefined;
    const markers = new Map<string, Marker>();
    const countryMarkers: Marker[] = [];
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
        view.on("load", () => {
          let fitted = false;
          view.addSource("listens", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
            cluster: true,
            clusterRadius: 48,
            clusterMaxZoom: 14,
            clusterProperties: {
              listens: ["+", ["get", "listens"]],
              west: ["min", ["get", "west"]],
              south: ["min", ["get", "south"]],
              east: ["max", ["get", "east"]],
              north: ["max", ["get", "north"]],
            },
          });
          // Keep the source active; accessible HTML buttons render its clusters.
          view.addLayer({
            id: "listens",
            type: "circle",
            source: "listens",
            paint: { "circle-radius": 0, "circle-opacity": 0 },
          });
          const source = view.getSource("listens") as GeoJSONSource;
          const compact = new Intl.NumberFormat("en", {
            notation: "compact",
            maximumFractionDigits: 1,
          });
          const draw = () => {
            for (const marker of markers.values()) marker.remove();
            markers.clear();
            for (const marker of countryMarkers) marker.remove();
            countryMarkers.length = 0;
            const locations = points.current;
            const countries = pins.current.filter(
              (item) => countryCentroids[item.code],
            );
            for (const item of countries) {
              const button = document.createElement("button");
              button.type = "button";
              button.className =
                "flex h-9 min-w-9 items-center justify-center rounded-full border-2 border-primary bg-background/90 px-2 text-xs font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
              button.textContent = compact.format(item.listens);
              button.title = `${item.label}: ${item.listens.toLocaleString()} listens`;
              button.setAttribute("aria-label", button.title);
              button.onclick = () => selectCountry.current(item.code);
              countryMarkers.push(
                new L.Marker({ element: button })
                  .setLngLat(countryCentroids[item.code])
                  .addTo(view),
              );
            }
            source.setData({
              type: "FeatureCollection",
              features: locations.map((point, id) => ({
                type: "Feature",
                id,
                geometry: {
                  type: "Point",
                  coordinates: [point.longitude, point.latitude],
                },
                properties: {
                  ...point,
                  id,
                  west: point.longitude,
                  east: point.longitude,
                  south: point.latitude,
                  north: point.latitude,
                },
              })),
            });
            if (!fitted && (locations.length || countries.length)) {
              fitted = true;
              const bounds = new L.LngLatBounds();
              for (const point of locations)
                bounds.extend([point.longitude, point.latitude]);
              for (const item of countries)
                bounds.extend(countryCentroids[item.code]);
              view.fitBounds(bounds, { padding: 55, maxZoom: 10, duration: 0 });
            }
          };
          const syncMarkers = () => {
            if (!view.isSourceLoaded("listens")) return;
            const visible = new Set<string>();
            for (const feature of view.querySourceFeatures("listens")) {
              if (feature.geometry.type !== "Point") continue;
              const p = feature.properties;
              const key = p.cluster
                ? `cluster-${p.cluster_id}`
                : `point-${p.id}`;
              if (visible.has(key)) continue;
              visible.add(key);
              if (markers.has(key)) continue;
              const label = p.cluster ? `${p.point_count} locations` : p.label;
              const button = document.createElement("button");
              button.type = "button";
              button.className =
                "flex h-11 min-w-11 items-center justify-center rounded-full border-2 border-background bg-primary px-2 text-xs font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
              button.textContent = compact.format(p.listens);
              button.title = `${label}: ${Number(p.listens).toLocaleString()} listens`;
              button.setAttribute("aria-label", button.title);
              button.onclick = () => {
                select.current([p.west, p.south, p.east, p.north], label);
                if (p.cluster)
                  view.fitBounds(
                    [
                      [p.west, p.south],
                      [p.east, p.north],
                    ],
                    { padding: 60, maxZoom: Math.min(view.getZoom() + 3, 15) },
                  );
              };
              const [longitude, latitude] = feature.geometry.coordinates;
              markers.set(
                key,
                new L.Marker({ element: button })
                  .setLngLat([longitude, latitude])
                  .addTo(view),
              );
            }
            for (const [key, marker] of markers) {
              if (!visible.has(key)) {
                marker.remove();
                markers.delete(key);
              }
            }
          };
          redraw.current = draw;
          draw();
          view.on("sourcedata", (event) => {
            if (event.sourceId === "listens") syncMarkers();
          });
          view.on("moveend", syncMarkers);
        });
      })
      .catch(() => {
        if (!disposed) setError(true);
      });
    return () => {
      disposed = true;
      redraw.current = null;
      observer?.disconnect();
      for (const marker of markers.values()) marker.remove();
      for (const marker of countryMarkers) marker.remove();
      map?.remove();
    };
  }, []);

  useEffect(() => {
    redraw.current?.();
  }, [locations, countries]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      <section
        ref={container}
        aria-label="Listening locations. Select a marker to see songs."
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
