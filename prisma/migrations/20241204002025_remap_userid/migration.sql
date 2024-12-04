PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Create temporary mapping table
CREATE TABLE "_UserIdMapping" (
    "oldId" TEXT NOT NULL PRIMARY KEY,
    "newId" TEXT NOT NULL
);

-- Insert mappings from Provider accountId to User id
INSERT INTO "_UserIdMapping" ("oldId", "newId")
SELECT accountId, userId
FROM Provider
WHERE type = 'spotify';

-- Update LikedSongs table
UPDATE LikedSongs
SET userId = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = LikedSongs.userId
);

-- Update RecentSongs table
UPDATE RecentSongs
SET userId = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = RecentSongs.userId
);

-- Update Playback table
UPDATE Playback
SET userId = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = Playback.userId
);

-- Update PlaybackHistory table
UPDATE PlaybackHistory
SET userId = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = PlaybackHistory.userId
);

-- Update Feed table
UPDATE Feed
SET userId = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = Feed.userId
);

-- Update Follow table
UPDATE Follow
SET followingId = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = Follow.followingId
);

UPDATE Follow
SET followerId = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = Follow.followerId
);

-- Update Playlist table
UPDATE Playlist
SET userId = (
    SELECT newId 
    FROM "_UserIdMapping" 
    WHERE oldId = Playlist.userId
);

-- Clean up
DROP TABLE "_UserIdMapping";

-- Re-enable foreign key constraints
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;