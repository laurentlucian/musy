import { Database } from "bun:sqlite";
import { beforeEach, expect, mock, test } from "bun:test";

const db = new Database(":memory:");
db.exec(`CREATE TABLE HistoryImport (userId TEXT PRIMARY KEY,jobId TEXT,status TEXT,statsYear INTEGER,statsUpdatedAt INTEGER,updatedAt INTEGER);
CREATE TABLE HistoryEvent(userId TEXT,playedAt TEXT);`);
const send = mock(async (_message: unknown) => {});
const all = mock(async (_args: unknown) => {});
const annual = mock(async (_args: unknown) => {});
const D1 = {
  prepare(sql: string) {
    return {
      bind(...params: (string | number | null)[]) {
        return {
          async first() {
            return db.query(sql).get(...params);
          },
          async all() {
            return { results: db.query(sql).all(...params) };
          },
          async run() {
            return { meta: { changes: db.query(sql).run(...params).changes } };
          },
        };
      },
    };
  },
};
mock.module("cloudflare:workers", () => ({
  env: { D1, DELIVERY_QUEUE: { send } },
}));
mock.module("../app/lib.server/services/analytics", () => ({
  refreshAnalytics: mock(async () => {}),
}));
mock.module("../app/lib.server/services/scheduler/scripts/sync/stats", () => ({
  syncUserStatsAll: all,
  syncUserStats: annual,
}));
const { processHistoryStats, recoverHistoryStats } = await import(
  "../app/lib.server/services/history-stats"
);
const state = () =>
  db.query("SELECT * FROM HistoryImport WHERE userId='u'").get();
beforeEach(() => {
  db.exec(
    "DELETE FROM HistoryImport; DELETE FROM HistoryEvent; INSERT INTO HistoryImport VALUES ('u','job','processing',-1,0,0); INSERT INTO HistoryEvent VALUES ('u','2023-01-01'),('u','2024-01-01');",
  );
  send.mockReset();
  all.mockReset();
  annual.mockReset();
});
test("rebuilds each year before publishing all-time stats", async () => {
  await processHistoryStats("u", "job");
  expect(annual).toHaveBeenLastCalledWith({ userId: "u", year: 2023 });
  expect(all).not.toHaveBeenCalled();
  expect(state()).toMatchObject({ statsYear: 2024, status: "processing" });
  await processHistoryStats("u", "job");
  expect(annual).toHaveBeenLastCalledWith({ userId: "u", year: 2024 });
  expect(all).toHaveBeenCalledWith({ userId: "u" });
  expect(state()).toMatchObject({ statsYear: null, status: "complete" });
  expect(send).toHaveBeenCalledTimes(1);
});
test("failed computation releases lease and retries same checkpoint", async () => {
  annual.mockImplementationOnce(async () => {
    throw new Error("temporary");
  });
  await expect(processHistoryStats("u", "job")).rejects.toThrow("temporary");
  expect(state()).toMatchObject({ statsYear: -1, statsUpdatedAt: 0 });
  await processHistoryStats("u", "job");
  expect(state()).toMatchObject({ statsYear: 2024 });
});
test("duplicate queue messages acquire one lease", async () => {
  await Promise.all([
    processHistoryStats("u", "job"),
    processHistoryStats("u", "job"),
  ]);
  expect(annual).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledTimes(1);
});
test("stale job cannot advance or enqueue a replacement import", async () => {
  annual.mockImplementationOnce(async () => {
    db.exec(
      "UPDATE HistoryImport SET jobId='replacement',statsYear=-1,statsUpdatedAt=0",
    );
  });
  await processHistoryStats("u", "job");
  expect(state()).toMatchObject({ jobId: "replacement", statsYear: -1 });
  expect(send).not.toHaveBeenCalled();
});
test("recovery enqueues expired jobs only", async () => {
  db.run(
    "INSERT INTO HistoryImport VALUES ('active','a','processing',-1,?,0)",
    [Date.now()],
  );
  db.exec("INSERT INTO HistoryImport VALUES ('done','d','complete',NULL,0,0)");
  await recoverHistoryStats();
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith({
    type: "history-stats",
    userId: "u",
    jobId: "job",
  });
});
test("queue delivery failure leaves next checkpoint recoverable", async () => {
  send.mockImplementationOnce(async () => {
    throw new Error("queue unavailable");
  });
  await expect(processHistoryStats("u", "job")).rejects.toThrow(
    "queue unavailable",
  );
  expect(state()).toMatchObject({
    statsYear: 2024,
    statsUpdatedAt: 0,
    status: "processing",
  });
  await recoverHistoryStats();
  expect(send).toHaveBeenCalledTimes(2);
});
