export function dashboardSourceRevision(user: string, year: string) {
  return `json_array(
    COALESCE((SELECT SUM(revision) FROM AnalyticsYear ay WHERE ay.userId=${user} AND (${year}=0 OR ay.year=${year})),0),
    COALESCE((SELECT SUM(publishedRevision) FROM AnalyticsYear ay WHERE ay.userId=${user} AND (${year}=0 OR ay.year=${year})),0),
    (SELECT revision FROM DashboardMetadataRevision WHERE id=1),
    COALESCE((SELECT revision FROM DashboardUserRevision WHERE userId=${user}),0))`;
}

export const dashboardSnapshotState = `SELECT s.payload,s.sourceRevision,
  ${dashboardSourceRevision("?1", "?2")} AS currentRevision,
  EXISTS(SELECT 1 FROM AnalyticsYear WHERE userId=?1 AND (?2=0 OR year=?2) AND revision<>publishedRevision) AS dirty,
  (SELECT json_group_array(year) FROM (SELECT year FROM AnalyticsYear WHERE userId=?1 ORDER BY year DESC)) AS years
  FROM (SELECT 1) LEFT JOIN DashboardSnapshot s ON s.userId=?1 AND s.year=?2`;

export const dashboardSnapshotPublish = `INSERT INTO DashboardSnapshot(userId,year,sourceRevision,payload,updatedAt)
  SELECT ?1,?2,?3,?4,?5 WHERE ?3=${dashboardSourceRevision("?1", "?2")}
  AND NOT EXISTS(SELECT 1 FROM AnalyticsYear WHERE userId=?1 AND (?2=0 OR year=?2) AND revision<>publishedRevision)
  AND EXISTS(SELECT 1 FROM Profile WHERE id=?1)
  ON CONFLICT(userId,year) DO UPDATE SET sourceRevision=excluded.sourceRevision,payload=excluded.payload,updatedAt=excluded.updatedAt`;

export const dashboardSnapshotNeedsRefresh = `NOT EXISTS(SELECT 1 FROM DashboardSnapshot s
 WHERE s.userId=AnalyticsYear.userId AND s.year=AnalyticsYear.year
 AND s.sourceRevision=${dashboardSourceRevision("AnalyticsYear.userId", "AnalyticsYear.year")})
 OR NOT EXISTS(SELECT 1 FROM DashboardSnapshot s WHERE s.userId=AnalyticsYear.userId AND s.year=0
 AND s.sourceRevision=${dashboardSourceRevision("AnalyticsYear.userId", "0")})`;
