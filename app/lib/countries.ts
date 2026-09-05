const names = new Intl.DisplayNames(["en"], {
  type: "region",
  fallback: "none",
});

export function normalizeCountry(value: string | null): string | null {
  const code = value?.trim().toUpperCase();
  if (!code || !/^[A-Z]{2}$/.test(code) || code === "ZZ") return null;
  return names.of(code) ? code : null;
}

export function countryName(code: string): string {
  return names.of(code) ?? code;
}
