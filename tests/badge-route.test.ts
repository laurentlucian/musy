import { expect, test } from "bun:test";

test("badge routes validate selectors and isolate users", () => {
  // Keep Worker and service mocks isolated from other test modules.
  const result = Bun.spawnSync([process.execPath, "test", "./tests/badge-route.fixture.ts"], {
    cwd: import.meta.dir + "/..",
  });
  expect(result.stderr.toString()).toContain("3 pass");
  expect(result.exitCode).toBe(0);
});
