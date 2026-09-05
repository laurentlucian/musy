DROP TRIGGER dashboard_metadata_track_update;
CREATE TRIGGER dashboard_metadata_track_update AFTER UPDATE OF name,albumId ON Track
WHEN OLD.name IS NOT NEW.name OR OLD.albumId IS NOT NEW.albumId BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
DROP TRIGGER dashboard_metadata_album_update;
CREATE TRIGGER dashboard_metadata_album_update AFTER UPDATE OF name ON Album
WHEN OLD.name IS NOT NEW.name BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
DROP TRIGGER dashboard_metadata_artist_update;
CREATE TRIGGER dashboard_metadata_artist_update AFTER UPDATE OF name ON Artist
WHEN OLD.name IS NOT NEW.name BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
DROP TRIGGER dashboard_metadata_tracktoartist_update;
CREATE TRIGGER dashboard_metadata_tracktoartist_update AFTER UPDATE ON _TrackToArtist
WHEN OLD.trackId IS NOT NEW.trackId OR OLD.artistId IS NOT NEW.artistId BEGIN
 UPDATE DashboardMetadataRevision SET revision=revision+1 WHERE id=1;
END;
