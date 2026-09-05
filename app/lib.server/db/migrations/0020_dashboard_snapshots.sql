CREATE TABLE DashboardSnapshot (
 userId TEXT NOT NULL REFERENCES Profile(id) ON DELETE CASCADE,
 year INTEGER NOT NULL, sourceRevision TEXT NOT NULL, payload TEXT NOT NULL, updatedAt INTEGER NOT NULL,
 PRIMARY KEY(userId,year)
);
CREATE TABLE DashboardMetadataRevision (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL);
INSERT INTO DashboardMetadataRevision VALUES(1,1);
CREATE TABLE DashboardUserRevision (
 userId TEXT PRIMARY KEY REFERENCES Profile(id) ON DELETE CASCADE, revision INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO AnalyticsYear(userId,year)
 SELECT userId,CAST(strftime('%Y',createdAt) AS INTEGER) FROM LikedTracks
 WHERE strftime('%Y',createdAt) IS NOT NULL GROUP BY userId,strftime('%Y',createdAt);
CREATE TRIGGER dashboard_metadata_track_update AFTER UPDATE OF name,albumId ON Track BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
CREATE TRIGGER dashboard_metadata_track_delete AFTER DELETE ON Track BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
CREATE TRIGGER dashboard_metadata_album_insert AFTER INSERT ON Album BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
CREATE TRIGGER dashboard_metadata_album_update AFTER UPDATE OF name ON Album BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
CREATE TRIGGER dashboard_metadata_album_delete AFTER DELETE ON Album BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
CREATE TRIGGER dashboard_metadata_artist_insert AFTER INSERT ON Artist BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
CREATE TRIGGER dashboard_metadata_artist_update AFTER UPDATE OF name ON Artist BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
CREATE TRIGGER dashboard_metadata_artist_delete AFTER DELETE ON Artist BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
CREATE TRIGGER dashboard_metadata_tracktoartist_insert AFTER INSERT ON _TrackToArtist BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
CREATE TRIGGER dashboard_metadata_tracktoartist_update AFTER UPDATE ON _TrackToArtist BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
CREATE TRIGGER dashboard_metadata_tracktoartist_delete AFTER DELETE ON _TrackToArtist BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
CREATE TRIGGER dashboard_likes_insert AFTER INSERT ON LikedTracks BEGIN
INSERT INTO DashboardUserRevision(userId) SELECT NEW.userId WHERE EXISTS (SELECT 1 FROM Profile WHERE id=NEW.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
 INSERT OR IGNORE INTO AnalyticsYear(userId,year)
 SELECT NEW.userId,CAST(strftime('%Y',NEW.createdAt) AS INTEGER)
 WHERE strftime('%Y',NEW.createdAt) IS NOT NULL AND EXISTS (SELECT 1 FROM Profile WHERE id=NEW.userId);
END;
CREATE TRIGGER dashboard_likes_update AFTER UPDATE ON LikedTracks BEGIN
INSERT INTO DashboardUserRevision(userId) SELECT OLD.userId WHERE EXISTS (SELECT 1 FROM Profile WHERE id=OLD.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
 INSERT OR IGNORE INTO AnalyticsYear(userId,year)
 SELECT OLD.userId,CAST(strftime('%Y',OLD.createdAt) AS INTEGER)
 WHERE strftime('%Y',OLD.createdAt) IS NOT NULL AND EXISTS (SELECT 1 FROM Profile WHERE id=OLD.userId);
INSERT INTO DashboardUserRevision(userId) SELECT NEW.userId WHERE EXISTS (SELECT 1 FROM Profile WHERE id=NEW.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
 INSERT OR IGNORE INTO AnalyticsYear(userId,year)
 SELECT NEW.userId,CAST(strftime('%Y',NEW.createdAt) AS INTEGER)
 WHERE strftime('%Y',NEW.createdAt) IS NOT NULL AND EXISTS (SELECT 1 FROM Profile WHERE id=NEW.userId);
END;
CREATE TRIGGER dashboard_likes_delete AFTER DELETE ON LikedTracks BEGIN
INSERT INTO DashboardUserRevision(userId) SELECT OLD.userId WHERE EXISTS (SELECT 1 FROM Profile WHERE id=OLD.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
 INSERT OR IGNORE INTO AnalyticsYear(userId,year)
 SELECT OLD.userId,CAST(strftime('%Y',OLD.createdAt) AS INTEGER)
 WHERE strftime('%Y',OLD.createdAt) IS NOT NULL AND EXISTS (SELECT 1 FROM Profile WHERE id=OLD.userId);
END;
ALTER TABLE Stats ADD COLUMN trackId TEXT;
ALTER TABLE Stats ADD COLUMN artistId TEXT;
ALTER TABLE Stats ADD COLUMN albumId TEXT;
