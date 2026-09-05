import { deleteHistoryArchives } from "./history-archive";

type CleanupEnv = { D1: D1Database; HISTORY_ARCHIVES: R2Bucket };

export async function deleteAccount(database: D1Database, userId: string) {
  await database.batch([
    database
      .prepare(
        "INSERT INTO ArchiveCleanup(userId,retryAt) VALUES (?,?) ON CONFLICT(userId) DO UPDATE SET retryAt=excluded.retryAt",
      )
      .bind(userId, Date.now() + 86400000),
    ...[
      "DELETE FROM PlaylistTrack WHERE playlistId IN (SELECT id FROM Playlist WHERE userId=?)",
      "DELETE FROM QueueGroup WHERE userId=?",
      "DELETE FROM QueueItem WHERE userId=?",
      "DELETE FROM Stats WHERE userId=?",
      "DELETE FROM Sync WHERE userId=?",
      "DELETE FROM Provider WHERE userId=?",
      "DELETE FROM LikedTracks WHERE userId=?",
      "DELETE FROM RecentTracks WHERE userId=?",
      "DELETE FROM Playback WHERE userId=?",
      "DELETE FROM PlaybackHistory WHERE userId=?",
      "DELETE FROM TopTracks WHERE userId=?",
      "DELETE FROM TopArtists WHERE userId=?",
      "DELETE FROM Top WHERE userId=?",
      "DELETE FROM Playlist WHERE userId=?",
      "DELETE FROM Profile WHERE id=?",
      "DELETE FROM User WHERE id=?",
    ].map((sql) => database.prepare(sql).bind(userId)),
  ]);
}

export async function recoverArchiveCleanup(env: CleanupEnv) {
  const { results } = await env.D1.prepare(
    "SELECT userId FROM ArchiveCleanup WHERE retryAt<=? AND NOT EXISTS(SELECT 1 FROM User WHERE User.id=ArchiveCleanup.userId) ORDER BY retryAt LIMIT 5",
  )
    .bind(Date.now())
    .all<{ userId: string }>();
  for (const { userId } of results) {
    try {
      await deleteHistoryArchives(env, userId);
      await env.D1.prepare("DELETE FROM ArchiveCleanup WHERE userId=?")
        .bind(userId)
        .run();
    } catch {
      await env.D1.prepare("UPDATE ArchiveCleanup SET retryAt=? WHERE userId=?")
        .bind(Date.now() + 60000, userId)
        .run();
      console.error("History archive cleanup failed; retry scheduled");
    }
  }
}
