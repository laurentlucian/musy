import { badgeIcons } from "./badge-icons";

export function escapeSvg(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character]!,
  );
}

export function renderBadge(label: string, value: string, detail: string) {
  const characters = Array.from(value);
  const visible =
    characters.length > 28 ? `${characters.slice(0, 27).join("")}…` : value;
  const labelWidth = Math.ceil(label.length * 6.6) + 38;
  const valueWidth = Math.ceil(Array.from(visible).length * 6.6) + 22;
  const width = labelWidth + valueWidth;
  const title = escapeSvg(`Musy · ${label}: ${value}. ${detail}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28" viewBox="0 0 ${width} 28" role="img" aria-label="${title}">
  <title>${title}</title>
  <clipPath id="badge"><rect width="${width}" height="28" rx="3"/></clipPath>
  <g clip-path="url(#badge)">
    <path fill="#30363d" d="M0 0h${labelWidth}v28H0z"/>
    <path fill="#a3e635" d="M${labelWidth} 0h${valueWidth}v28H${labelWidth}z"/>
  </g>
  <svg x="9" y="5" width="18" height="18" viewBox="0 0 256 256" fill="#a3e635" aria-hidden="true">${badgeIcons[label] ?? badgeIcons["Hours listened"]}</svg>
  <g font-family="DejaVu Sans Mono,Consolas,monospace" font-size="11" text-anchor="middle">
    <text x="${(labelWidth + 28) / 2}" y="18" fill="#ffffff" textLength="${label.length * 6.6}" lengthAdjust="spacingAndGlyphs">${escapeSvg(label.toUpperCase())}</text>
    <text x="${labelWidth + valueWidth / 2}" y="18" fill="#172009" textLength="${Array.from(visible).length * 6.6}" lengthAdjust="spacingAndGlyphs">${escapeSvg(visible)}</text>
  </g>
</svg>`;
}
