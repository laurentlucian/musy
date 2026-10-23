CREATE INDEX ListeningTrackSummary_track_user_idx ON ListeningTrackSummary(trackId,userId);
CREATE INDEX Track_albumId_dashboard_idx ON Track(albumId);
DROP TRIGGER dashboard_metadata_album_insert;
DROP TRIGGER dashboard_metadata_artist_insert;
DROP TRIGGER dashboard_metadata_track_update;
CREATE TRIGGER dashboard_metadata_track_update AFTER UPDATE OF name,albumId ON Track
WHEN OLD.name IS NOT NEW.name OR OLD.albumId IS NOT NEW.albumId BEGIN
 INSERT INTO DashboardUserRevision(userId) SELECT DISTINCT s.userId FROM ListeningTrackSummary s
 WHERE s.trackId IN (SELECT OLD.id UNION SELECT NEW.id) AND EXISTS (SELECT 1 FROM Profile WHERE id=s.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
END;
DROP TRIGGER dashboard_metadata_track_delete;
CREATE TRIGGER dashboard_metadata_track_delete BEFORE DELETE ON Track
BEGIN
 INSERT INTO DashboardUserRevision(userId) SELECT DISTINCT s.userId FROM ListeningTrackSummary s
 WHERE s.trackId IN (SELECT OLD.id) AND EXISTS (SELECT 1 FROM Profile WHERE id=s.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
END;
DROP TRIGGER dashboard_metadata_album_update;
CREATE TRIGGER dashboard_metadata_album_update AFTER UPDATE OF name ON Album
WHEN OLD.name IS NOT NEW.name BEGIN
 INSERT INTO DashboardUserRevision(userId) SELECT DISTINCT s.userId FROM ListeningTrackSummary s
 WHERE s.trackId IN (SELECT id FROM Track WHERE albumId=OLD.id OR albumId=NEW.id) AND EXISTS (SELECT 1 FROM Profile WHERE id=s.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
END;
DROP TRIGGER dashboard_metadata_album_delete;
CREATE TRIGGER dashboard_metadata_album_delete BEFORE DELETE ON Album
BEGIN
 INSERT INTO DashboardUserRevision(userId) SELECT DISTINCT s.userId FROM ListeningTrackSummary s
 WHERE s.trackId IN (SELECT id FROM Track WHERE albumId=OLD.id) AND EXISTS (SELECT 1 FROM Profile WHERE id=s.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
END;
DROP TRIGGER dashboard_metadata_artist_update;
CREATE TRIGGER dashboard_metadata_artist_update AFTER UPDATE OF name ON Artist
WHEN OLD.name IS NOT NEW.name BEGIN
 INSERT INTO DashboardUserRevision(userId) SELECT DISTINCT s.userId FROM ListeningTrackSummary s
 WHERE s.trackId IN (SELECT trackId FROM _TrackToArtist WHERE artistId=OLD.id OR artistId=NEW.id) AND EXISTS (SELECT 1 FROM Profile WHERE id=s.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
END;
DROP TRIGGER dashboard_metadata_artist_delete;
CREATE TRIGGER dashboard_metadata_artist_delete BEFORE DELETE ON Artist
BEGIN
 INSERT INTO DashboardUserRevision(userId) SELECT DISTINCT s.userId FROM ListeningTrackSummary s
 WHERE s.trackId IN (SELECT trackId FROM _TrackToArtist WHERE artistId=OLD.id) AND EXISTS (SELECT 1 FROM Profile WHERE id=s.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
END;
DROP TRIGGER dashboard_metadata_tracktoartist_insert;
CREATE TRIGGER dashboard_metadata_tracktoartist_insert AFTER INSERT ON _TrackToArtist
BEGIN
 INSERT INTO DashboardUserRevision(userId) SELECT DISTINCT s.userId FROM ListeningTrackSummary s
 WHERE s.trackId IN (SELECT NEW.trackId) AND EXISTS (SELECT 1 FROM Profile WHERE id=s.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
END;
DROP TRIGGER dashboard_metadata_tracktoartist_update;
CREATE TRIGGER dashboard_metadata_tracktoartist_update AFTER UPDATE ON _TrackToArtist
WHEN OLD.trackId IS NOT NEW.trackId OR OLD.artistId IS NOT NEW.artistId BEGIN
 INSERT INTO DashboardUserRevision(userId) SELECT DISTINCT s.userId FROM ListeningTrackSummary s
 WHERE s.trackId IN (SELECT OLD.trackId UNION SELECT NEW.trackId) AND EXISTS (SELECT 1 FROM Profile WHERE id=s.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
END;
DROP TRIGGER dashboard_metadata_tracktoartist_delete;
CREATE TRIGGER dashboard_metadata_tracktoartist_delete BEFORE DELETE ON _TrackToArtist
BEGIN
 INSERT INTO DashboardUserRevision(userId) SELECT DISTINCT s.userId FROM ListeningTrackSummary s
 WHERE s.trackId IN (SELECT OLD.trackId) AND EXISTS (SELECT 1 FROM Profile WHERE id=s.userId)
 ON CONFLICT(userId) DO UPDATE SET revision=revision+1;
END;
