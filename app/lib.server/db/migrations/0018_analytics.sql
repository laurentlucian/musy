CREATE TABLE AnalyticsYear (
 userId TEXT NOT NULL REFERENCES Profile(id) ON DELETE CASCADE,
 year INTEGER NOT NULL, revision INTEGER NOT NULL DEFAULT 1,
 publishedRevision INTEGER NOT NULL DEFAULT 0, updatedAt INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(userId, year)
);
CREATE TABLE ListeningTrackSummary (
 userId TEXT NOT NULL REFERENCES Profile(id) ON DELETE CASCADE, year INTEGER NOT NULL,
 trackId TEXT NOT NULL, archiveArtist TEXT NOT NULL, archiveAlbum TEXT NOT NULL,
 plays INTEGER NOT NULL, milliseconds INTEGER NOT NULL, estimatedPlays INTEGER NOT NULL, unknownPlays INTEGER NOT NULL,
 PRIMARY KEY(userId, year, trackId, archiveArtist, archiveAlbum)
);
CREATE TABLE ListeningDaySummary (
 userId TEXT NOT NULL REFERENCES Profile(id) ON DELETE CASCADE, year INTEGER NOT NULL,
 day TEXT NOT NULL, hour TEXT NOT NULL, plays INTEGER NOT NULL, milliseconds INTEGER NOT NULL,
 PRIMARY KEY(userId, year, day, hour)
);
INSERT INTO AnalyticsYear(userId,year)
 SELECT userId, CAST(strftime('%Y',playedAt) AS INTEGER) FROM RecentTracks
 WHERE strftime('%Y',playedAt) IS NOT NULL GROUP BY userId, strftime('%Y',playedAt);
CREATE TRIGGER analytics_recent_insert AFTER INSERT ON RecentTracks BEGIN
INSERT INTO AnalyticsYear(userId,year) SELECT NEW.userId, CAST(strftime('%Y',NEW.playedAt) AS INTEGER)
 WHERE strftime('%Y',NEW.playedAt) IS NOT NULL
 ON CONFLICT(userId,year) DO UPDATE SET revision=revision+1;
END;
CREATE TRIGGER analytics_recent_update AFTER UPDATE OF userId,playedAt,trackId,msPlayed,historyEventId ON RecentTracks BEGIN
INSERT INTO AnalyticsYear(userId,year) SELECT OLD.userId, CAST(strftime('%Y',OLD.playedAt) AS INTEGER)
 WHERE strftime('%Y',OLD.playedAt) IS NOT NULL AND EXISTS (SELECT 1 FROM Profile WHERE id=OLD.userId)
 ON CONFLICT(userId,year) DO UPDATE SET revision=revision+1;
INSERT INTO AnalyticsYear(userId,year) SELECT NEW.userId, CAST(strftime('%Y',NEW.playedAt) AS INTEGER)
 WHERE strftime('%Y',NEW.playedAt) IS NOT NULL
 ON CONFLICT(userId,year) DO UPDATE SET revision=revision+1;
END;
CREATE TRIGGER analytics_recent_delete AFTER DELETE ON RecentTracks BEGIN
INSERT INTO AnalyticsYear(userId,year) SELECT OLD.userId, CAST(strftime('%Y',OLD.playedAt) AS INTEGER)
 WHERE strftime('%Y',OLD.playedAt) IS NOT NULL AND EXISTS (SELECT 1 FROM Profile WHERE id=OLD.userId)
 ON CONFLICT(userId,year) DO UPDATE SET revision=revision+1;
END;
CREATE INDEX RecentTracks_trackId_analytics_idx ON RecentTracks(trackId, userId);
CREATE TRIGGER analytics_track_duration AFTER UPDATE OF duration ON Track WHEN OLD.duration IS NOT NEW.duration BEGIN
 UPDATE AnalyticsYear SET revision=revision+1 WHERE userId IN (SELECT userId FROM RecentTracks WHERE trackId=NEW.id);
END;
CREATE TRIGGER analytics_track_delete BEFORE DELETE ON Track BEGIN
 UPDATE AnalyticsYear SET revision=revision+1 WHERE userId IN (SELECT userId FROM RecentTracks WHERE trackId=OLD.id);
END;
CREATE TRIGGER analytics_history_update AFTER UPDATE OF artistName,albumName ON HistoryEvent WHEN OLD.artistName IS NOT NEW.artistName OR OLD.albumName IS NOT NEW.albumName BEGIN
 UPDATE AnalyticsYear SET revision=revision+1 WHERE userId=NEW.userId;
END;
CREATE INDEX RecentTracks_user_utc_year_idx ON RecentTracks(userId, CAST(strftime('%Y',playedAt) AS INTEGER));
