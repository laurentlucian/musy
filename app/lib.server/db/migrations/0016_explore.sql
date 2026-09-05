CREATE INDEX HistoryEvent_user_cursor_idx ON HistoryEvent(userId, playedAt DESC, id DESC);
CREATE INDEX HistoryEvent_user_country_cursor_idx ON HistoryEvent(userId, UPPER(TRIM(country)), playedAt DESC, id DESC);
CREATE TABLE HistoryExploreSummary (
  userId TEXT NOT NULL REFERENCES Profile(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  value TEXT NOT NULL,
  listens INTEGER NOT NULL,
  msPlayed INTEGER NOT NULL,
  PRIMARY KEY(userId, kind, value)
) WITHOUT ROWID;
INSERT INTO HistoryExploreSummary SELECT userId, 'total', '', COUNT(*), SUM(msPlayed) FROM HistoryEvent GROUP BY userId, '';
INSERT INTO HistoryExploreSummary SELECT userId, 'country', COALESCE(UPPER(TRIM(country)), ''), COUNT(*), SUM(msPlayed) FROM HistoryEvent GROUP BY userId, COALESCE(UPPER(TRIM(country)), '');
INSERT INTO HistoryExploreSummary SELECT userId, 'platform', COALESCE(platform, ''), COUNT(*), SUM(msPlayed) FROM HistoryEvent GROUP BY userId, COALESCE(platform, '');
CREATE TRIGGER HistoryExploreSummary_insert AFTER INSERT ON HistoryEvent BEGIN
  INSERT INTO HistoryExploreSummary VALUES (NEW.userId, 'total', '', 1, NEW.msPlayed) ON CONFLICT(userId, kind, value) DO UPDATE SET listens=listens+1, msPlayed=msPlayed+NEW.msPlayed;
  INSERT INTO HistoryExploreSummary VALUES (NEW.userId, 'country', COALESCE(UPPER(TRIM(NEW.country)), ''), 1, NEW.msPlayed) ON CONFLICT(userId, kind, value) DO UPDATE SET listens=listens+1, msPlayed=msPlayed+NEW.msPlayed;
  INSERT INTO HistoryExploreSummary VALUES (NEW.userId, 'platform', COALESCE(NEW.platform, ''), 1, NEW.msPlayed) ON CONFLICT(userId, kind, value) DO UPDATE SET listens=listens+1, msPlayed=msPlayed+NEW.msPlayed;
END;
CREATE TRIGGER HistoryExploreSummary_delete AFTER DELETE ON HistoryEvent BEGIN
  UPDATE HistoryExploreSummary SET listens=listens-1, msPlayed=msPlayed-OLD.msPlayed WHERE userId=OLD.userId AND kind='total' AND value='';
  UPDATE HistoryExploreSummary SET listens=listens-1, msPlayed=msPlayed-OLD.msPlayed WHERE userId=OLD.userId AND kind='country' AND value=COALESCE(UPPER(TRIM(OLD.country)), '');
  UPDATE HistoryExploreSummary SET listens=listens-1, msPlayed=msPlayed-OLD.msPlayed WHERE userId=OLD.userId AND kind='platform' AND value=COALESCE(OLD.platform, '');
  DELETE FROM HistoryExploreSummary WHERE userId=OLD.userId AND listens=0;
END;
CREATE TRIGGER HistoryExploreSummary_update AFTER UPDATE OF userId, country, platform, msPlayed ON HistoryEvent BEGIN
  UPDATE HistoryExploreSummary SET listens=listens-1, msPlayed=msPlayed-OLD.msPlayed WHERE userId=OLD.userId AND kind='total' AND value='';
  UPDATE HistoryExploreSummary SET listens=listens-1, msPlayed=msPlayed-OLD.msPlayed WHERE userId=OLD.userId AND kind='country' AND value=COALESCE(UPPER(TRIM(OLD.country)), '');
  UPDATE HistoryExploreSummary SET listens=listens-1, msPlayed=msPlayed-OLD.msPlayed WHERE userId=OLD.userId AND kind='platform' AND value=COALESCE(OLD.platform, '');
  DELETE FROM HistoryExploreSummary WHERE userId=OLD.userId AND listens=0;
  INSERT INTO HistoryExploreSummary VALUES (NEW.userId, 'total', '', 1, NEW.msPlayed) ON CONFLICT(userId, kind, value) DO UPDATE SET listens=listens+1, msPlayed=msPlayed+NEW.msPlayed;
  INSERT INTO HistoryExploreSummary VALUES (NEW.userId, 'country', COALESCE(UPPER(TRIM(NEW.country)), ''), 1, NEW.msPlayed) ON CONFLICT(userId, kind, value) DO UPDATE SET listens=listens+1, msPlayed=msPlayed+NEW.msPlayed;
  INSERT INTO HistoryExploreSummary VALUES (NEW.userId, 'platform', COALESCE(NEW.platform, ''), 1, NEW.msPlayed) ON CONFLICT(userId, kind, value) DO UPDATE SET listens=listens+1, msPlayed=msPlayed+NEW.msPlayed;
END;
