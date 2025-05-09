export function joinIdsArrayToString(ids: string[]) {
  return ids.join(",");
}

export function generateQueryParametersString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  }

  const string = queryParams.toString();

  return string ? `?${string}` : "";
}

export function encodeStringToBase64(str: string): string {
  return typeof Buffer !== "undefined"
    ? Buffer.from(str).toString("base64")
    : btoa(str);
}

export function getRequestBody(data: any): string | undefined {
  if (!data) {
    return undefined;
  }

  if (typeof data === "string") {
    return data;
  }

  return JSON.stringify(data);
}

export default joinIdsArrayToString;
