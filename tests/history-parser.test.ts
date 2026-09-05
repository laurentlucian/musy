import { describe, expect, test } from "bun:test";
import { historyBatches, parseHistory } from "../app/lib/history-parser";

describe("history parser", () => {
  test("preserves raw IP, device and unknown fields", () => {
    const row = {
      ts: "2020-01-01T00:00:00Z",
      ms_played: 12,
      ip_addr: "1.2.3.4",
      platform: "iPhone",
      future: { nested: true },
    };
    expect(
      parseHistory(`\uFEFF${JSON.stringify([row])}`, "history.json"),
    ).toEqual([row]);
  });
  test("rejects basic exports and malformed records", () => {
    expect(() => parseHistory('[{"endTime":"2020"}]', "basic.json")).toThrow(
      "Extended",
    );
    expect(() => parseHistory("[null]", "bad.json")).toThrow(
      "invalid listening",
    );
    expect(() => parseHistory("{}", "bad.json")).toThrow("array");
    expect(() => parseHistory("no", "bad.json")).toThrow("invalid JSON");
  });
  test("bounds batches by rows and UTF-8 bytes without dropping records", () => {
    const rows = Array.from({ length: 250 }, (_, i) => ({
      ts: String(i),
      ms_played: 1,
      platform: "é".repeat(2000),
    }));
    const batches = [...historyBatches(rows)];
    expect(batches.flat()).toEqual(rows);
    for (const batch of batches) {
      expect(batch.length).toBeLessThanOrEqual(100);
      expect(
        new TextEncoder().encode(JSON.stringify(batch)).length,
      ).toBeLessThanOrEqual(250000);
    }
  });
});
