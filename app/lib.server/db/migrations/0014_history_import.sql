CREATE TABLE HistoryEvent (id TEXT PRIMARY KEY NOT NULL, userId TEXT NOT NULL REFERENCES Profile(id) ON DELETE CASCADE, batchId TEXT NOT NULL, trackId TEXT NOT NULL, trackName TEXT NOT NULL, artistName TEXT NOT NULL, albumName TEXT NOT NULL, playedAt TEXT NOT NULL, msPlayed INTEGER NOT NULL, ip TEXT, platform TEXT, country TEXT, rawJson TEXT NOT NULL);
CREATE INDEX HistoryEvent_user_date_idx ON HistoryEvent(userId, playedAt);
CREATE INDEX HistoryEvent_batch_idx ON HistoryEvent(batchId);
CREATE TABLE HistoryImport (userId TEXT PRIMARY KEY NOT NULL REFERENCES Profile(id) ON DELETE CASCADE, jobId TEXT NOT NULL, status TEXT NOT NULL, updatedAt INTEGER NOT NULL);
CREATE TABLE HistoryImportBatch (id TEXT PRIMARY KEY NOT NULL, userId TEXT NOT NULL REFERENCES Profile(id) ON DELETE CASCADE, jobId TEXT NOT NULL, imported INTEGER NOT NULL, duplicates INTEGER NOT NULL, skipped INTEGER NOT NULL);
CREATE INDEX HistoryImportBatch_user_job_idx ON HistoryImportBatch(userId, jobId);
ALTER TABLE RecentTracks ADD COLUMN historyEventId TEXT REFERENCES HistoryEvent(id);
ALTER TABLE RecentTracks ADD COLUMN msPlayed INTEGER;
DROP INDEX RecentTracks_playedAt_userId_key;
CREATE UNIQUE INDEX RecentTracks_playedAt_userId_key ON RecentTracks(playedAt, userId, trackId) WHERE historyEventId IS NULL;
CREATE UNIQUE INDEX RecentTracks_historyEventId_key ON RecentTracks(historyEventId);

CREATE TABLE `GeoIP` (
  `ip` text PRIMARY KEY NOT NULL,
  `latitude` numeric,
  `longitude` numeric,
  `city` text,
  `region` text,
  `country` text,
  `status` text NOT NULL,
  `updatedAt` integer NOT NULL
);
CREATE TABLE `HistoryGeoJob` (
  `userId` text PRIMARY KEY NOT NULL REFERENCES `User`(`id`) ON DELETE CASCADE,
  `status` text NOT NULL DEFAULT 'queued',
  `updatedAt` integer NOT NULL,
  `retryAt` integer NOT NULL DEFAULT 0,
  `attempts` integer NOT NULL DEFAULT 0,
  `lease` text,
  `error` text
);
CREATE INDEX `HistoryEvent_userId_ip_idx` ON `HistoryEvent` (`userId`, `ip`);

ALTER TABLE HistoryImport ADD COLUMN statsYear INTEGER DEFAULT -1;
ALTER TABLE HistoryImport ADD COLUMN statsUpdatedAt INTEGER NOT NULL DEFAULT 0;
ALTER TABLE HistoryImportBatch ADD COLUMN payloadHash TEXT NOT NULL DEFAULT '';

CREATE TRIGGER RecentTracks_skip_imported_api
BEFORE INSERT ON RecentTracks
WHEN NEW.historyEventId IS NULL AND EXISTS (
  SELECT 1 FROM HistoryEvent
  WHERE userId=NEW.userId AND trackId=NEW.trackId AND playedAt=NEW.playedAt
)
BEGIN
  SELECT RAISE(IGNORE);
END;
