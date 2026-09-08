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
  const truncate = (text: string, length: number) => {
    const characters = Array.from(text);
    return escapeSvg(
      characters.length > length
        ? `${characters.slice(0, length - 1).join("")}…`
        : text,
    );
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="116" viewBox="0 0 420 116" role="img" aria-label="${escapeSvg(`${label}: ${value}. ${detail}`)}">
  <title>${escapeSvg(`${label}: ${value}. ${detail}`)}</title>
  <rect x=".5" y=".5" width="419" height="115" rx="16" fill="#111315" stroke="#303438"/>
  <g fill="#a3e635"><rect x="22" y="20" width="3" height="10" rx="1.5"/><rect x="28" y="16" width="3" height="18" rx="1.5"/><rect x="34" y="12" width="3" height="26" rx="1.5"/><rect x="40" y="18" width="3" height="14" rx="1.5"/></g>
  <g font-family="Arial,Helvetica,sans-serif">
    <text x="54" y="29" fill="#b8bfc5" font-size="11" letter-spacing="1.5">MUSY / ${escapeSvg(label.toUpperCase())}</text>
    <text x="22" y="68" fill="#f5f7f8" font-size="23" font-weight="600">${truncate(value, 28)}</text>
    <text x="22" y="94" fill="#a2aab2" font-size="12">${truncate(detail, 53)}</text>
  </g>
</svg>`;
}
