// https://github.com/devicekit/DeviceKit/blob/master/Source/Device.generated.swift
const modelNames: Record<string, string> = {
  "iphone4,1": "iPhone 4s",
  "iphone5,2": "iPhone 5",
  "iphone5,3": "iPhone 5c",
  "iphone7,1": "iPhone 6 Plus",
  "iphone9,1": "iPhone 7",
  "iphone9,2": "iPhone 7 Plus",
  "iphone10,3": "iPhone X",
  "iphone11,6": "iPhone XS Max",
  "iphone11,8": "iPhone XR",
  "iphone13,3": "iPhone 12 Pro",
  "iphone14,2": "iPhone 13 Pro",
};

export function deviceLabel(platform: string | null): string {
  if (!platform?.trim()) return "Unknown device";
  const model = platform.match(
    /\b(iPhone\d+,\d+|iPad\d+,\d+|iPod\d+,\d+)\b/i,
  )?.[1];
  if (model) {
    const identifier = model.toLowerCase();
    return (
      modelNames[identifier] ??
      `${identifier.startsWith("iphone") ? "iPhone" : identifier.startsWith("ipad") ? "iPad" : "iPod"} · ${model}`
    );
  }
  const value = platform.toLowerCase();
  if (value === "ios" || value.startsWith("ios ")) return "iOS";
  if (value.includes("echo_dot")) return "Amazon Echo Dot";
  if (value.includes("amazon_echo") || value.includes(";echo;"))
    return "Amazon Echo";
  if (value.includes("google_home_max")) return "Google Home Max";
  if (value.includes("google_home")) return "Google Home";
  if (value.includes("roku")) return "Roku TV";
  if (value.includes("os x") || value === "osx" || value.includes("macos"))
    return "Mac";
  if (value.includes("windows")) return "Windows";
  if (value.includes("android")) return "Android";
  if (value.includes("web") || value.includes("browser")) return "Web player";
  if (value.includes("cast")) return "Cast · device unknown";
  if (value.includes("playstation")) return "PlayStation";
  if (value.includes("linux")) return "Linux";
  return "Other device";
}

export function listeningTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  return minutes >= 60
    ? `${Math.floor(minutes / 60).toLocaleString()}h ${minutes % 60}m`
    : `${minutes.toLocaleString()}m`;
}
