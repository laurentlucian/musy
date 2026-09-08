import { beforeEach, expect, mock, test } from "bun:test";
import { data } from "react-router";

const calls: string[] = [];
mock.module("../app/lib.server/services/usernames", () => ({
  resolveProfileId: async (value: string, fallback: unknown) => {
    expect(fallback).toBeNull();
    if (value === "missing") throw data(null, { status: 404 });
    return value.toLowerCase() === "alice" ? "alice-id" : value;
  },
}));
mock.module("../app/lib.server/services/dashboard", () => ({
  getDashboard: async (id: string) => {
    calls.push(`hours:${id}`);
    return { minutes: id === "alice-id" ? 120 : 180, played: 1 };
  },
}));
mock.module("../app/lib.server/services/profile-genres", () => ({
  getProfileGenres: async (id: string) => {
    calls.push(`genres:${id}`);
    return { genres: [{ name: id }], updatedAt: "2026-09-07" };
  },
}));
mock.module("cloudflare:workers", () => ({
  env: {
    D1: {
      prepare: () => ({
        bind: (id: string) => ({
          first: async () => {
            calls.push(`repeat:${id}`);
            return null;
          },
        }),
      }),
    },
  },
}));
const { loader } = await import("../app/routes/resources/badge");
const load = (badge: string, query: string) =>
  loader({
    params: { badge },
    request: new Request(`https://musy.example/badges/${badge}${query}`),
  } as Parameters<typeof loader>[0]);

beforeEach(() => {
  calls.length = 0;
});

test("requires one nonempty bounded user identifier", async () => {
  for (const query of [
    "",
    "?user=",
    "?user=%20",
    "?user=a&user=b",
    `?user=${"a".repeat(129)}`,
  ]) {
    await expect(load("hours.svg", query)).rejects.toMatchObject({
      status: 400,
    });
  }
  expect(calls).toEqual([]);
});

test("unknown profiles return uncached 404 without reading listening data", async () => {
  try {
    await load("hours.svg", "?user=missing");
    throw new Error("Expected rejection");
  } catch (error) {
    expect(error).toBeInstanceOf(Response);
    expect((error as Response).status).toBe(404);
    expect((error as Response).headers.get("Cache-Control")).toBe("no-store");
  }
  expect(calls).toEqual([]);
});

test("all badges use the resolved username or explicit user ID", async () => {
  for (const [input, id] of [
    ["ALICE", "alice-id"],
    ["other-id", "other-id"],
  ]) {
    for (const name of ["hours", "genres", "repeat"]) {
      const response = await load(`${name}.svg`, `?user=${input}`);
      expect(response.status).toBe(200);
      expect(calls.at(-1)).toBe(`${name}:${id}`);
      if (name === "hours")
        expect(await response.text()).toContain(
          id === "alice-id" ? "2 hours" : "3 hours",
        );
    }
  }
});
