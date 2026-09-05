import { dashboardSnapshotNeedsRefresh } from "./dashboard-snapshot-query";
export function analyticsRebuildStatements() {
  return [
    "DELETE FROM ListeningTrackSummary WHERE userId=? AND year=?",
    `INSERT INTO ListeningTrackSummary(userId,year,trackId,archiveArtist,archiveAlbum,plays,milliseconds,estimatedPlays,unknownPlays)
     SELECT r.userId,?,r.trackId,COALESCE(h.artistName,''),COALESCE(h.albumName,''),
       COUNT(*),SUM(COALESCE(r.msPlayed,t.duration,0)),SUM(r.msPlayed IS NULL AND t.duration>0),SUM(r.msPlayed IS NULL AND COALESCE(t.duration,0)<=0)
     FROM RecentTracks r JOIN Track t ON t.id=r.trackId
     LEFT JOIN HistoryEvent h ON h.id=r.historyEventId AND h.userId=r.userId
     WHERE r.userId=? AND CAST(strftime('%Y',r.playedAt) AS INTEGER)=?
     GROUP BY r.trackId,COALESCE(h.artistName,''),COALESCE(h.albumName,'')`,
    "DELETE FROM ListeningDaySummary WHERE userId=? AND year=?",
    `INSERT INTO ListeningDaySummary(userId,year,day,hour,plays,milliseconds)
     SELECT r.userId,?,date(r.playedAt),strftime('%H',r.playedAt),COUNT(*),SUM(COALESCE(r.msPlayed,t.duration,0))
     FROM RecentTracks r JOIN Track t ON t.id=r.trackId
     WHERE r.userId=? AND CAST(strftime('%Y',r.playedAt) AS INTEGER)=?
     GROUP BY date(r.playedAt),strftime('%H',r.playedAt)`,
    "UPDATE AnalyticsYear SET publishedRevision=revision,updatedAt=? WHERE userId=? AND year=?",
  ];
}

export const analyticsNeedsRefresh = `${dashboardSnapshotNeedsRefresh} OR revision<>publishedRevision OR NOT EXISTS (
  SELECT 1 FROM Stats s WHERE s.userId=AnalyticsYear.userId AND s.year=AnalyticsYear.year
    AND s.updatedAt>=strftime('%Y-%m-%dT%H:%M:%fZ',AnalyticsYear.updatedAt/1000.0,'unixepoch')
) OR NOT EXISTS (
  SELECT 1 FROM Stats s WHERE s.userId=AnalyticsYear.userId AND s.year=0
    AND s.updatedAt>=strftime('%Y-%m-%dT%H:%M:%fZ',AnalyticsYear.updatedAt/1000.0,'unixepoch')
)`;
