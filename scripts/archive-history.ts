import { getPlatformProxy } from "wrangler";
import { archiveHistoryChunk } from "../app/lib.server/services/history-archive.ts";

const userId = process.argv[2];
if (!userId)
  throw new Error("Usage: node scripts/archive-history.ts <user-id|--all>");
const platform = await getPlatformProxy<Env>({ remoteBindings: true });
async function archiveChunk(owner: string) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await archiveHistoryChunk(platform.env, owner);
    } catch (error) {
      if (attempt >= 5) throw error;
      const delay = 1000 * 2 ** (attempt - 1);
      console.warn(
        `Archive chunk failed (attempt ${attempt}/5); retrying in ${delay / 1000}s.`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
try {
  const users =
    userId === "--all"
      ? (
          await platform.env.D1.prepare(
            "SELECT DISTINCT userId FROM HistoryEvent WHERE archiveKey IS NULL",
          ).all<{ userId: string }>()
        ).results.map((row) => row.userId)
      : [userId];
  let chunks = 0;
  for (const owner of users) {
    while (await archiveChunk(owner)) {
      chunks++;
      if (chunks % 10 === 0)
        console.log(`Archived ${chunks * 500} records (maximum).`);
    }
  }
  console.log(`Archive complete: ${chunks} verified chunks.`);
} finally {
  await platform.dispose();
}
