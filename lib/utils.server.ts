export function generateId(length = 10) {
  if (length % 2) length++;
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let id = "";
  for (let i = 0; i < length; i++) {
    const alphabet = i % 2 ? upper : lower;
    id += alphabet[bytes[i] % alphabet.length];
  }

  return id;
}

export function getMemoryStats() {
  const mem = process.memoryUsage();
  return {
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
    rss: Math.round(mem.rss / 1024 / 1024),
    external: Math.round(mem.external / 1024 / 1024),
  };
}
