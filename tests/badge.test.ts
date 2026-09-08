import { expect, test } from "bun:test";
import { renderBadge } from "../app/lib/badge";

test("escapes provider text in SVG content and attributes", () => {
  const svg = renderBadge("On repeat", '<script>alert("x")</script>', "A & B");
  expect(svg).not.toContain("<script>");
  expect(svg).toContain("&lt;script&gt;");
  expect(svg).toContain("A &amp; B");
});

test("limits visible text while preserving the accessible full title", () => {
  const value = "A very long song title that cannot fit into this badge";
  const svg = renderBadge("On repeat", value, "Artist");
  expect(svg).toContain(`<title>Musy · On repeat: ${value}. Artist</title>`);
  expect(svg).toContain("A very long song title that…");
});
