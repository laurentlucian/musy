import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type {
  ListeningLocation,
  MapBounds,
} from "~/lib.server/services/history-insights";

export default function ListeningMap({
  locations,
  onSelect,
}: {
  locations: ListeningLocation[];
  onSelect: (bounds: MapBounds, label: string) => void;
}) {
  const container = useRef<HTMLElement>(null);
  const select = useRef(onSelect);
  const points = useRef(locations);
  const redraw = useRef<(() => void) | null>(null);
  points.current = locations;
  const [error, setError] = useState(false);
  select.current = onSelect;

  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | undefined;
    void import("leaflet")
      .then((L) => {
        if (disposed || !container.current) return;
        map = L.map(container.current, {
          scrollWheelZoom: false,
          minZoom: 2,
          maxZoom: 16,
        }).setView([25, 0], 2);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);
        const markers = L.layerGroup().addTo(map);
        let fitted = false;
        const draw = () => {
          if (!map) return;
          const locations = points.current;
          if (!fitted && locations.length) {
            fitted = true;
            map.fitBounds(
              locations.map(
                (point) =>
                  [point.latitude, point.longitude] as [number, number],
              ),
              { padding: [55, 55], maxZoom: 10 },
            );
          }
          markers.clearLayers();
          const clusters = new Map<string, ListeningLocation[]>();
          for (const location of locations) {
            const point = map.project(
              [location.latitude, location.longitude],
              map.getZoom(),
            );
            const key = `${Math.floor(point.x / 64)},${Math.floor(point.y / 64)}`;
            const group = clusters.get(key) ?? [];
            group.push(location);
            clusters.set(key, group);
          }
          for (const group of clusters.values()) {
            const listens = group.reduce(
              (sum, point) => sum + point.listens,
              0,
            );
            const latitude =
              group.reduce(
                (sum, point) => sum + point.latitude * point.listens,
                0,
              ) / listens;
            const longitude =
              group.reduce(
                (sum, point) => sum + point.longitude * point.listens,
                0,
              ) / listens;
            const label =
              group.length === 1 ? group[0].label : `${group.length} locations`;
            const element = document.createElement("span");
            element.className =
              "flex h-full w-full items-center justify-center rounded-full border-2 border-background bg-primary px-1 text-xs font-semibold text-primary-foreground shadow-sm";
            element.textContent = new Intl.NumberFormat("en", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(listens);
            const marker = L.marker([latitude, longitude], {
              title: `${label}: ${listens.toLocaleString()} listens`,
              alt: `${label}: ${listens.toLocaleString()} listens`,
              icon: L.divIcon({
                html: element,
                className: "",
                iconSize: [44, 44],
                iconAnchor: [22, 22],
              }),
            }).addTo(markers);
            marker.on("click", () => {
              select.current(
                [
                  Math.min(...group.map((point) => point.longitude)),
                  Math.min(...group.map((point) => point.latitude)),
                  Math.max(...group.map((point) => point.longitude)),
                  Math.max(...group.map((point) => point.latitude)),
                ],
                label,
              );
              if (group.length > 1 && map)
                map.fitBounds(
                  group.map(
                    (point) =>
                      [point.latitude, point.longitude] as [number, number],
                  ),
                  {
                    padding: [60, 60],
                    maxZoom: Math.min(map.getZoom() + 3, 13),
                  },
                );
            });
          }
        };
        redraw.current = draw;
        draw();
        map.on("zoomend", draw);
        const observer = new ResizeObserver(() => map?.invalidateSize());
        observer.observe(container.current);
        map.on("unload", () => observer.disconnect());
      })
      .catch(() => {
        if (!disposed) setError(true);
      });
    return () => {
      disposed = true;
      redraw.current = null;
      map?.remove();
    };
  }, []);

  useEffect(() => {
    redraw.current?.();
  }, [locations]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border">
      <section
        ref={container}
        aria-label="Listening locations. Select a marker to see songs."
        className="isolate h-[62vh] min-h-96 w-full bg-muted"
      />
      {error && (
        <p
          role="alert"
          className="absolute inset-x-4 top-4 z-[1000] rounded-md bg-background p-3 text-sm"
        >
          Map unavailable. Your listening history is below.
        </p>
      )}
    </div>
  );
}
